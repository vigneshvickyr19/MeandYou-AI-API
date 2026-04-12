import { Request, Response } from 'express';
import { aiProvider } from '../../core/providers/ai.provider';
import { sendSuccess, sendError } from '../../core/utils/response.helper';

export class AiController {
  /**
   * POST /api/ai/generate-bio
   */
  async generateBio(req: Request, res: Response) {
    try {
      const { interests, personality } = req.body;
      
      if (!interests || !personality) {
        return sendError(res, "Interests and personality are required", 400);
      }

      const bio = await aiProvider.generateBio(interests, personality);
      
      return sendSuccess(res, { bio });
    } catch (error: any) {
      return sendError(res, "AI temporarily unavailable", 500, error.message);
    }
  }

  /**
   * POST /api/ai/first-message
   */
  async suggestFirstMessage(req: Request, res: Response) {
    try {
      const { profile } = req.body;

      if (!profile) {
        return sendError(res, "Profile context is required", 400);
      }

      const messages = await aiProvider.suggestFirstMessage(profile);

      return sendSuccess(res, { messages }, { count: messages.length });
    } catch (error: any) {
      return sendError(res, "AI temporarily unavailable", 500, error.message);
    }
  }

  /**
   * POST /api/ai/suggest-replies
   */
  async suggestReplies(req: Request, res: Response) {
    try {
      const { chat } = req.body;

      if (!chat) {
        return sendError(res, "Last message or chat history is required", 400);
      }

      const replies = await aiProvider.suggestReplies(chat);

      return sendSuccess(res, { replies });
    } catch (error: any) {
      return sendError(res, "AI temporarily unavailable", 500, error.message);
    }
  }
}

export const aiController = new AiController();
