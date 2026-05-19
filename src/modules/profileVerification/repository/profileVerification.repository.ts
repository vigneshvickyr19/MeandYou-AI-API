import axios from 'axios';
import { RekognitionClient, CompareFacesCommand, CompareFacesCommandOutput } from '@aws-sdk/client-rekognition';
import { config } from '../../../core/config/env.config';
import { logger } from '../../../core/utils/logger';

export class ProfileVerificationRepository {
  private rekognitionClient: RekognitionClient;

  constructor() {
    this.rekognitionClient = new RekognitionClient({
      region: config.aws.region,
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      }
    });
  }

  /**
   * Downloads an image from a URL and returns it as a Buffer
   */
  async downloadImage(url: string): Promise<Buffer> {
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      
      const contentType = response.headers['content-type'];
      const buffer = Buffer.from(response.data);
      
      logger.info(`Downloaded image from ${url.substring(0, 50)}... | Type: ${contentType} | Size: ${buffer.length} bytes`);
      
      if (!contentType?.includes('image/jpeg') && !contentType?.includes('image/png')) {
        logger.warn(`Warning: Image format might not be supported by AWS Rekognition. Content-Type: ${contentType}`);
      }
      
      return buffer;
    } catch (error: any) {
      logger.error(`Failed to download image from ${url}`, error.message);
      throw new Error(`Failed to download image: ${error.message}`);
    }
  }

  /**
   * Compares a source face with a target face using AWS Rekognition
   */
  async compareFaces(sourceImageBuffer: Buffer, targetImageBuffer: Buffer, similarityThreshold: number = 85): Promise<CompareFacesCommandOutput> {
    try {
      logger.info('Calling AWS Rekognition CompareFaces...');
      const command = new CompareFacesCommand({
        SourceImage: { Bytes: sourceImageBuffer },
        TargetImage: { Bytes: targetImageBuffer },
        SimilarityThreshold: 0 // Set to 0 to get the exact similarity score even if it's very low
      });

      const response = await this.rekognitionClient.send(command);
      
      logger.info('AWS Rekognition Response:', JSON.stringify({
        sourceImageFaces: response.SourceImageFace,
        faceMatchesCount: response.FaceMatches?.length || 0,
        similarities: response.FaceMatches?.map(m => m.Similarity),
        unmatchedFacesCount: response.UnmatchedFaces?.length || 0
      }));
      
      return response;
    } catch (error: any) {
      logger.error('AWS Rekognition CompareFaces failed', {
        message: error.message,
        code: error.code,
        name: error.name,
        metadata: error.$metadata
      });
      throw new Error(`Face comparison failed: ${error.message}`);
    }
  }
}
