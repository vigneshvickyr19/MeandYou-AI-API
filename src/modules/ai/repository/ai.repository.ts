import axios from 'axios';
import { config } from '../../../core/config/env.config';
import { DeepSeekChatResponse } from '../types/ai.types';
import { logger } from '../../../core/utils/logger';

export class AiRepository {
  private readonly baseUrl = config.deepseek.baseUrl;
  private readonly apiKey = config.deepseek.apiKey;
  private readonly model = config.deepseek.model;

  async getCompletion(systemPrompt: string, userPrompt: string): Promise<DeepSeekChatResponse> {
    try {
      const response = await axios.post<DeepSeekChatResponse>(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 500,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      logger.error('DeepSeek API Error', error?.response?.data || error.message);
      throw new Error('Failed to get response from AI service');
    }
  }
}
