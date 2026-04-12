export interface GenerateBioRequest {
  interests: string;
  personality: string;
}

export interface FirstMessageRequest {
  profile: string;
}

export interface SuggestRepliesRequest {
  chat: string;
}

export interface DeepSeekChatResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
  model: string;
}
