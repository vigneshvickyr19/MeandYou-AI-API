import { Request, Response, NextFunction } from 'express';
import { ProfileVerificationService } from '../service/profileVerification.service';
import { sendSuccess, sendError } from '../../../core/utils/response.helper';
import { VerifyProfileRequestDto } from '../types/profileVerification.types';
import { logger } from '../../../core/utils/logger';

export class ProfileVerificationController {
  constructor(private readonly profileVerificationService: ProfileVerificationService) {}

  verifyProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload: VerifyProfileRequestDto = req.body;

      // Basic validation
      if (!payload.userId) {
        sendError(res, 'userId is required', 400);
        return;
      }
      if (!Array.isArray(payload.profileImages) || !Array.isArray(payload.liveImages)) {
        sendError(res, 'profileImages and liveImages must be arrays', 400);
        return;
      }

      const result = await this.profileVerificationService.verifyProfile(payload);

      let message = 'Face verification failed';
      if (result.verificationStatus === 'VERIFIED') {
        message = 'Profile verification completed';
      } else if (result.verificationStatus === 'MANUAL_REVIEW') {
        message = 'Manual review required';
      }

      sendSuccess(res, result, { message });
    } catch (error: any) {
      logger.error('Profile verification controller error', error);
      sendError(res, error.message || 'Face verification encountered an error', 500);
    }
  };
}
