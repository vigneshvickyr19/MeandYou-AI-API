import { Request, Response } from 'express';
import { AiService } from '../service/ai.service';
import { sendSuccess, sendError } from '../../../core/utils/response.helper';
import { GenerateBioRequest, FirstMessageRequest, SuggestRepliesRequest, AnalyzeProfileRequest } from '../types/ai.types';

export class AiController {
  constructor(private readonly aiService: AiService) {}

  generateBio = async (req: Request, res: Response) => {
    try {
      const { interests, personality }: GenerateBioRequest = req.body;
      
      if (!interests || !personality) {
        return sendError(res, 'Interests and personality are required', 400);
      }

      const result = await this.aiService.generateBio(interests, personality);
      return sendSuccess(res, { bios: result.bios }, { model: result.model });
    } catch (error: any) {
      return sendError(res, error.message);
    }
  };

  firstMessage = async (req: Request, res: Response) => {
    try {
      const { profile }: FirstMessageRequest = req.body;

      if (!profile) {
        return sendError(res, 'Profile context is required', 400);
      }

      const result = await this.aiService.suggestFirstMessages(profile);
      return sendSuccess(res, { messages: result.messages }, { count: result.count });
    } catch (error: any) {
      return sendError(res, error.message);
    }
  };

  suggestReplies = async (req: Request, res: Response) => {
    try {
      const { chat }: SuggestRepliesRequest = req.body;

      if (!chat) {
        return sendError(res, 'Chat history is required', 400);
      }

      // Truncate chat history to last 5 messages for cost/token optimization
      // Assuming messages are newline separated or similar. 
      // A more robust implementation would parse a JSON array.
      const lastMessages = chat.split('\n').slice(-5).join('\n');

      const result = await this.aiService.suggestReplies(lastMessages);
      return sendSuccess(res, { replies: result.replies });
    } catch (error: any) {
      return sendError(res, error.message);
    }
  };

  analyzeProfile = async (req: Request, res: Response) => {
    try {
      const profileData: AnalyzeProfileRequest = req.body;

      if (!profileData.basicInfo || !profileData.photos) {
        return sendError(res, 'Photos and Basic Info are required for analysis', 400);
      }

      const result = await this.aiService.analyzeProfile(profileData);
      return sendSuccess(res, result);
    } catch (error: any) {
      return sendError(res, error.message);
    }
  };
}
