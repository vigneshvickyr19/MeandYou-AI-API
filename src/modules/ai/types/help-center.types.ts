export interface HelpCenterRequest {
  message: string;
  categoryId: string;
}

export type HelpIntent = 
  | 'account_issue'
  | 'payment_issue'
  | 'chat_issue'
  | 'technical_issue'
  | 'privacy_issue'
  | 'safety_abuse'
  | 'report_user'
  | 'block_user'
  | 'general';

export interface AiIntentResponse {
  intent: HelpIntent;
  keywords: string[];
  isSafetyRelated: boolean;
  suggestedActions: string[];
}

export interface FAQ {
  id?: string;
  question: string;
  answer: string;
  categoryId: string;
  keywords: string[];
  priority: number;
  status: boolean;
}

export interface HelpCenterResponse {
  intent: HelpIntent;
  question: string;
  answer: string;
  actions: string[];
  categoryId: string;
}
