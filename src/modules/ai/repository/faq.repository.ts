import { firestore } from '../../../core/providers/firebase.provider';
import { FAQ } from '../types/help-center.types';
import { logger } from '../../../core/utils/logger';

export class FaqRepository {
  async getFaqsByCategoryId(categoryId: string): Promise<FAQ[]> {
    try {
      const snapshot = await firestore
        .collection('faqs')
        .where('categoryId', '==', categoryId)
        .where('status', '==', true)
        .get();

      const faqs: FAQ[] = [];
      snapshot.forEach(doc => {
        faqs.push({ id: doc.id, ...doc.data() } as FAQ);
      });

      // Sort manually in memory to avoid Firestore composite index requirement
      faqs.sort((a, b) => (a.priority || 0) - (b.priority || 0));
      
      return faqs;
    } catch (error) {
      logger.error(`Error fetching FAQs for category ${categoryId}`, error);
      return [];
    }
  }

  async getCategoryName(categoryId: string): Promise<string> {
    try {
      const doc = await firestore.collection('faq_categories').doc(categoryId).get();
      return doc.exists ? doc.data()?.name || 'General' : 'General';
    } catch (error) {
      logger.error(`Error fetching category ${categoryId}`, error);
      return 'General';
    }
  }
}
