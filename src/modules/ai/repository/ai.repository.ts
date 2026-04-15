import axios from 'axios';
import { config } from '../../../core/config/env.config';
import { AiResponse } from '../types/ai.types';
import { logger } from '../../../core/utils/logger';

export class AiRepository {
  private readonly geminiApiKey = config.gemini.apiKey;
  private readonly geminiModel = config.gemini.model;

  async getCompletion(systemPrompt: string, userPrompt: string): Promise<AiResponse> {
    if (!this.geminiApiKey) {
      throw new Error('Gemini API Key is not configured.');
    }

    try {
      // Gemini 1.5 format - Mapping to internal AiResponse shape for compatibility
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiApiKey}`;
      
      const response = await axios.post(
        url,
        {
          contents: [
            {
              role: 'user', 
              parts: [{ text: `System: ${systemPrompt}\n\nUser: ${userPrompt}` }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
            responseMimeType: "application/json",
          }
        }
      );

      const content = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      return {
        choices: [
          {
            message: {
              content: content.trim(),
            },
          },
        ],
        model: this.geminiModel,
      };
    } catch (error: any) {
      logger.error('Gemini Completion Error', error?.response?.data || error.message);
      throw new Error('AI Service unavailable');
    }
  }
}
