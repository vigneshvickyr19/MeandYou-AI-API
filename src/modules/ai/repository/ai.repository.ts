import axios from 'axios';
import { config } from '../../../core/config/env.config';
import { DeepSeekChatResponse } from '../types/ai.types';
import { logger } from '../../../core/utils/logger';

export class AiRepository {
  private readonly dsBaseUrl = config.deepseek.baseUrl;
  private readonly dsApiKey = config.deepseek.apiKey;
  private readonly dsModel = config.deepseek.model;

  private readonly geminiApiKey = config.gemini.apiKey;
  private readonly geminiModel = config.gemini.model;

  async getCompletion(systemPrompt: string, userPrompt: string): Promise<DeepSeekChatResponse> {
    // 1. If Gemini is explicitly requested as the only active provider
    if (config.gemini.enabled && !config.deepseek.enabled) {
      return await this.getGeminiCompletion(systemPrompt, userPrompt);
    }

    // 2. If DeepSeek is enabled (default behavior or explicit)
    if (config.deepseek.enabled) {
      try {
        return await this.getDeepSeekCompletion(systemPrompt, userPrompt);
      } catch (error: any) {
        const isBalanceError = error?.response?.data?.error?.message?.includes('Balance');
        
        // Auto-fallback if balance issue and Gemini is configured/available
        if (isBalanceError && config.gemini.apiKey) {
          logger.warn('DeepSeek balance empty, auto-falling back to Gemini...');
          return await this.getGeminiCompletion(systemPrompt, userPrompt);
        }
        throw error;
      }
    }

    // 3. Fallback to Gemini if nothing else works but it's configured
    if (config.gemini.apiKey) {
      return await this.getGeminiCompletion(systemPrompt, userPrompt);
    }

    throw new Error('No AI provider is enabled or configured.');
  }

  private async getDeepSeekCompletion(systemPrompt: string, userPrompt: string): Promise<DeepSeekChatResponse> {
    const response = await axios.post<DeepSeekChatResponse>(
      `${this.dsBaseUrl}/chat/completions`,
      {
        model: this.dsModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      },
      {
        headers: {
          'Authorization': `Bearer ${this.dsApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  }

  private async getGeminiCompletion(systemPrompt: string, userPrompt: string): Promise<DeepSeekChatResponse> {
    try {
      // Note: Gemini 1.5 format is different, we map it to our internal DeepSeekChatResponse shape
      // to maintain compatibility with the rest of the app.
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiApiKey}`;
      
      const response = await axios.post(
        url,
        {
          contents: [
            {
              role: 'user', // Gemini expects combined system/user or specific structure
              parts: [{ text: `System: ${systemPrompt}\n\nUser: ${userPrompt}` }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          }
        }
      );

      const content = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Normalize to our existing response type
      return {
        choices: [
          {
            message: {
              content: content.trim(),
            },
          },
        ],
        model: `fallback:${this.geminiModel}`,
      };
    } catch (error: any) {
      logger.error('Gemini Fallback Error', error?.response?.data || error.message);
      throw new Error('AI Service unavailable (all providers failed)');
    }
  }
}
