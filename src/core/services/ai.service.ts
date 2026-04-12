import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { config } from '../config/env.config';
import { logger } from '../utils/logger';

export class AiService {
  private static instance: AiService;
  private model: GenerativeModel;

  private constructor() {
    const apiKey = config.gemini.apiKey;
    const modelName = config.gemini.model || 'gemini-1.5-flash-latest';
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: modelName });
    
    logger.info(`AI Service initialized with model: ${modelName}`);
  }

  public static getInstance(): AiService {
    if (!AiService.instance) {
      AiService.instance = new AiService();
    }
    return AiService.instance;
  }

  /**
   * Generates a completion based on the provided prompt
   */
  async getCompletion(prompt: string, timeout: number = config.gemini.timeout): Promise<string> {
    logger.info('AI Request Start');
    
    try {
      const resultPromise = this.model.generateContent(prompt);
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('AI Request Timeout')), timeout)
      );

      const result = await Promise.race([resultPromise, timeoutPromise]) as any;
      const response = await result.response;
      const text = response.text();
      
      logger.info('AI Request Success');
      return text;
    } catch (error: any) {
      logger.error('Gemini Error', error.message || error);
      throw error;
    }
  }

  async generateBio(prompt: string): Promise<string> {
    return this.getCompletion(prompt);
  }

  async suggestFirstMessage(prompt: string): Promise<string> {
    return this.getCompletion(prompt);
  }

  async suggestReplies(prompt: string): Promise<string> {
    return this.getCompletion(prompt);
  }
}

export const aiService = AiService.getInstance();
