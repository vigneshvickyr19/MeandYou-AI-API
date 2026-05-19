export interface VerifyProfileRequestDto {
  userId: string;
  profileImages: string[];
  liveImages: string[];
}

export interface MatchResult {
  profileImageIndex: number;
  liveImageIndex: number;
  similarity: number;
  matched: boolean;
}

export interface VerifyProfileResponseDto {
  verified: boolean;
  verificationStatus: "VERIFIED" | "MANUAL_REVIEW" | "FAILED";
  highestSimilarity: number;
  averageSimilarity: number;
  matchedImagesCount: number;
  totalComparisons: number;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  matchedResults: MatchResult[];
}
