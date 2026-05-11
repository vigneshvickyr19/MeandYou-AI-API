import { Request, Response } from 'express';
import { HelpCenterService } from '../service/help-center.service';
import { sendSuccess, sendError } from '../../../core/utils/response.helper';
import { HelpCenterRequest } from '../types/help-center.types';

export class HelpCenterController {
  constructor(private readonly helpCenterService: HelpCenterService) {}

  processQuery = async (req: Request, res: Response) => {
    try {
      const { message, categoryId }: HelpCenterRequest = req.body;

      // Validation: message and categoryId required
      if (!message || typeof message !== 'string') {
        return sendError(res, 'Message is required', 400);
      }

      if (!categoryId || typeof categoryId !== 'string') {
        return sendError(res, 'categoryId is required', 400);
      }

      const trimmedMessage = message.trim();
      if (trimmedMessage.length < 3) {
        return sendError(res, 'Message is too short', 400);
      }

      const result = await this.helpCenterService.processQuery(trimmedMessage, categoryId);

      return sendSuccess(
        res, 
        result, 
        { message: 'Help center response fetched successfully' }
      );
    } catch (error: any) {
      return sendError(res, error.message || 'Unable to process request');
    }
  };
}
