import { AiRepository } from '../repository/ai.repository';
import { aiPrompts } from '../prompts/ai.prompts';
import { AnalyzeProfileRequest, AnalyzeProfileResponse } from '../types/ai.types';
import { logger } from '../../../core/utils/logger';

export class AiService {
  constructor(private readonly aiRepository: AiRepository) {}

  async generateBio(interests: string, personality: string) {
    const { system, user } = aiPrompts.generateBio(interests, personality);
    const response = await this.aiRepository.getCompletion(system, user);
    
    return {
      bio: response.choices[0]?.message.content.trim() || '',
      model: response.model
    };
  }

  async suggestFirstMessages(profile: string) {
    const { system, user } = aiPrompts.firstMessage(profile);
    const response = await this.aiRepository.getCompletion(system, user);
    
    // Split by newlines or numbered lists and clean up
    const content = response.choices[0]?.message.content || '';
    const messages = content
      .split('\n')
      .map(m => m.replace(/^\d+[\.\)]\s*/, '').trim())
      .filter(m => m.length > 0);

    return {
      messages,
      count: messages.length
    };
  }

  async suggestReplies(chat: string) {
    // Trim chat history if needed (handled by prompt engineering logic if we pass full chat)
    // Here we assume 'chat' is already the last 5 messages as per performance rule
    const { system, user } = aiPrompts.suggestReplies(chat);
    const response = await this.aiRepository.getCompletion(system, user);

    const content = response.choices[0]?.message.content || '';
    const replies = content
      .split('\n')
      .map(r => r.replace(/^\d+[\.\)]\s*/, '').trim())
      .filter(r => r.length > 0);

    return {
      replies
    };
  }

  async analyzeProfile(profileData: AnalyzeProfileRequest): Promise<AnalyzeProfileResponse> {
    const { system, user } = aiPrompts.analyzeProfile(JSON.stringify(profileData, null, 2));
    const response = await this.aiRepository.getCompletion(system, user);
    
    const content = response.choices[0]?.message.content || '';
    
    try {
      // 1. Try direct parse
      return JSON.parse(content) as AnalyzeProfileResponse;
    } catch (parseError) {
      try {
        // 2. Fallback: Try to extract JSON from markdown or text garbage
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]) as AnalyzeProfileResponse;
        }
        throw new Error('No JSON block found');
      } catch (fallbackError) {
        logger.error('AI Profile Analysis Parse Error', {
          content,
          error: content.length > 0 ? 'Invalid JSON format' : 'Empty response'
        });
        throw new Error('Failed to parse AI optimization response');
      }
    }
  }
}
