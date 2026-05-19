import { ProfileVerificationRepository } from '../repository/profileVerification.repository';
import { VerifyProfileRequestDto, VerifyProfileResponseDto, MatchResult } from '../types/profileVerification.types';
import { logger } from '../../../core/utils/logger';

export class ProfileVerificationService {
  constructor(private readonly repository: ProfileVerificationRepository) {}

  async verifyProfile(payload: VerifyProfileRequestDto): Promise<VerifyProfileResponseDto> {
    const { userId, profileImages, liveImages } = payload;

    if (!profileImages || profileImages.length === 0) {
      throw new Error('Profile images are required');
    }

    if (!liveImages || liveImages.length === 0) {
      throw new Error('Live images are required');
    }

    // 1. Download all images
    logger.info(`Starting profile verification for user: ${userId}`);
    
    // Download profile images in parallel
    const profileImageBuffers = await Promise.all(
      profileImages.map(url => this.repository.downloadImage(url))
    );

    // Download live images in parallel
    const liveImageBuffers = await Promise.all(
      liveImages.map(url => this.repository.downloadImage(url))
    );

    const matchResults: MatchResult[] = [];
    let totalComparisons = 0;
    const similarityThreshold = 85;

    // 2. Compare all combinations
    for (let pIndex = 0; pIndex < profileImageBuffers.length; pIndex++) {
      for (let lIndex = 0; lIndex < liveImageBuffers.length; lIndex++) {
        totalComparisons++;
        
        try {
          const response = await this.repository.compareFaces(
            profileImageBuffers[pIndex]!,
            liveImageBuffers[lIndex]!,
            similarityThreshold
          );

          // Get the highest similarity from the matches in this comparison
          let bestSimilarity = 0;
          if (response.FaceMatches && response.FaceMatches.length > 0) {
             bestSimilarity = response.FaceMatches.reduce((max, match) => {
               return (match.Similarity && match.Similarity > max) ? match.Similarity : max;
             }, 0);
          }

          const matched = bestSimilarity >= similarityThreshold;
          
          matchResults.push({
            profileImageIndex: pIndex,
            liveImageIndex: lIndex,
            similarity: Number(bestSimilarity.toFixed(2)),
            matched
          });
          
        } catch (error) {
          logger.warn(`Comparison failed for profile[${pIndex}] and live[${lIndex}]`, error);
          // We can record a failure as 0 similarity
          matchResults.push({
            profileImageIndex: pIndex,
            liveImageIndex: lIndex,
            similarity: 0,
            matched: false
          });
        }
      }
    }

    // 3. Calculate statistics
    const successfulMatches = matchResults.filter(m => m.matched);
    const matchedImagesCount = successfulMatches.length;
    
    const highestSimilarity = matchResults.reduce((max, match) => match.similarity > max ? match.similarity : max, 0);
    
    const totalSimilarity = matchResults.reduce((sum, match) => sum + match.similarity, 0);
    const averageSimilarity = Number((totalComparisons > 0 ? totalSimilarity / totalComparisons : 0).toFixed(2));

    // 4. Apply verification rules
    // Highest Similarity >= 90 AND At least 2 successful matches -> VERIFIED
    // Highest Similarity between 80 - 89 -> MANUAL_REVIEW
    // Highest Similarity < 80 -> FAILED
    
    let verificationStatus: "VERIFIED" | "MANUAL_REVIEW" | "FAILED" = "FAILED";
    let verified = false;
    let confidence: "HIGH" | "MEDIUM" | "LOW" = "LOW";

    if (highestSimilarity >= 90 && matchedImagesCount >= 2) {
      verificationStatus = "VERIFIED";
      verified = true;
      confidence = "HIGH";
    } else if (highestSimilarity >= 80 && highestSimilarity < 90) {
      verificationStatus = "MANUAL_REVIEW";
      verified = false;
      confidence = "MEDIUM";
    } else if (highestSimilarity >= 90 && matchedImagesCount < 2) {
       // Edge case: Very high similarity but only 1 match (maybe they only provided 1 image each)
       // The rules say "At least 2 successful matches -> VERIFIED"
       // So we should probably drop them to manual review if they don't have enough matches but good similarity
       verificationStatus = "MANUAL_REVIEW";
       verified = false;
       confidence = "MEDIUM";
    }

    // Example: Storing result in DB could happen here, or in another repository call.
    // await this.dbRepository.saveVerificationResult(userId, { ... });

    return {
      verified,
      verificationStatus,
      highestSimilarity,
      averageSimilarity,
      matchedImagesCount,
      totalComparisons,
      confidence,
      matchedResults: matchResults
    };
  }
}
