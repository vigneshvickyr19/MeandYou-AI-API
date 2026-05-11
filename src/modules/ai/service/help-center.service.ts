import { AiRepository } from '../repository/ai.repository';
import { FaqRepository } from '../repository/faq.repository';
import { aiPrompts } from '../prompts/ai.prompts';
import { AiIntentResponse, HelpCenterResponse, FAQ } from '../types/help-center.types';
import { logger } from '../../../core/utils/logger';

export class HelpCenterService {
  constructor(
    private readonly aiRepository: AiRepository,
    private readonly faqRepository: FaqRepository
  ) {}

  async processQuery(message: string, categoryId: string): Promise<HelpCenterResponse> {
    // 1. Fetch filtered FAQs from the specific category
    const filteredFaqs = await this.faqRepository.getFaqsByCategoryId(categoryId);
    
    // 2. Fetch category name for context
    const categoryName = await this.faqRepository.getCategoryName(categoryId);
    
    // 3. Prepare FAQs for AI context
    const faqsJson = JSON.stringify(filteredFaqs.map(f => ({
      question: f.question,
      answer: f.answer,
      keywords: f.keywords
    })));

    // 4. Let Gemini find the best match and detect safety actions
    const aiResult = await this.matchFaqWithAi(message, faqsJson, categoryName);

    // 4. LOCAL SUGGESTIONS: Strictly return the top 3 FAQs from this category by priority
    const localSuggestions = filteredFaqs
      .slice(0, 3)
      .map(f => f.question);
    
    return {
      intent: aiResult.intent,
      question: aiResult.question || (aiResult.isGreeting ? "Greeting" : "No specific match found"),
      answer: aiResult.answer || "I couldn't find a specific answer in this category. Please try rephrasing or contact support.",
      actions: aiResult.actions,
      categoryId: categoryId,
      suggestedQuestions: localSuggestions
    };
  }

  private async matchFaqWithAi(message: string, faqsJson: string, categoryName: string) {
    const { system, user } = aiPrompts.matchFaq(message, faqsJson, categoryName);
    const response = await this.aiRepository.getCompletion(system, user);
    const content = response.choices[0]?.message.content || '';

    try {
      const cleanJson = content.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (error) {
      logger.error('Failed to parse AI FAQ match response', { content, error });
      return {
        intent: 'general',
        question: null,
        answer: null,
        actions: [],
        matchFound: false
      };
    }
  }
}
