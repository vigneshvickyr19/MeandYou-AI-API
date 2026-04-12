import { aiService } from '../services/ai.service';
import { logger } from '../utils/logger';

export class AiProvider {
  private cache: Map<string, any> = new Map();

  /**
   * Generates a cache key based on inputs
   */
  private getCacheKey(type: string, ...args: string[]): string {
    return `${type}:${args.join('|')}`;
  }
  async generateBio(interests: string, personality: string): Promise<string> {
    const cacheKey = this.getCacheKey('bio', interests, personality);
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

    const prompt = `
      Create a dating app bio based on these details:
      Interests: ${interests}
      Personality: ${personality}
      
      Requirements:
      - Max 2 lines
      - Natural, human tone
      - No emoji overload
      - Do not include any labels like "Bio:"
    `.trim();

    try {
      const bio = await aiService.generateBio(prompt);
      const result = bio || this.getBioFallback();
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      return this.getBioFallback();
    }
  }

  /**
   * Personalized first message suggestions (3 variations)
   */
  async suggestFirstMessage(profileContext: string): Promise<string[]> {
    const cacheKey = this.getCacheKey('first-msgs-v2', profileContext);
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

    const prompt = `
      Based on this dating profile bio: "${profileContext}"
      Suggest 3 distinct, short, and natural first messages.
      
      Requirements:
      - Max 1 sentence each
      - Friendly and conversational
      - Include 1 relevant emoji per message
      - One should be a question, one a witty observation, and one a simple hook.
      - Return ONLY the messages, each on a new line.
    `.trim();

    try {
      const result = await aiService.suggestFirstMessage(prompt);
      if (!result) return [this.getFirstMessageFallback()];

      const messages = result
        .split('\n')
        .map(m => m.replace(/^\d+[\.\)]\s*/, '').trim())
        .filter(m => m.length > 0)
        .slice(0, 3);

      const finalMessages = messages.length > 0 ? messages : [this.getFirstMessageFallback()];
      this.cache.set(cacheKey, finalMessages);
      return finalMessages;
    } catch (error) {
      return [this.getFirstMessageFallback()];
    }
  }

  /**
   * Suggests 3 varied replies
   */
  async suggestReplies(lastMessage: string): Promise<string[]> {
    const cacheKey = this.getCacheKey('replies', lastMessage);
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

    const prompt = `
      The last message received was: "${lastMessage}".
      Suggest 3 short replies with different tones:
      1. Funny
      2. Casual
      3. Flirty
      
      Format: Return ONLY the 3 replies, each on a new line.
    `.trim();

    try {
      const result = await aiService.suggestReplies(prompt);
      if (!result) return this.getRepliesFallback();

      const replies = result
        .split('\n')
        .map(r => r.replace(/^\d+[\.\)]\s*/, '').trim())
        .filter(r => r.length > 0)
        .slice(0, 3);

      const finalReplies = replies.length > 0 ? replies : this.getRepliesFallback();
      this.cache.set(cacheKey, finalReplies);
      return finalReplies;
    } catch (error) {
      return this.getRepliesFallback();
    }
  }

  // Fallback Methods
  private getBioFallback(): string {
    return "Fun, easy-going person who loves good conversations.";
  }

  private getFirstMessageFallback(): string {
    return "Hey! How’s your day going 🙂";
  }

  private getRepliesFallback(): string[] {
    return [
      "That's so funny! Tell me more?",
      "Nice! How was your weekend?",
      "You sound like trouble (the good kind) 😉"
    ];
  }
}

export const aiProvider = new AiProvider();
