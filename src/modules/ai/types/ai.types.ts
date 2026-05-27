export interface AnalyzeProfileRequest {
  photos: { url: string; isPrimary: boolean }[];
  basicInfo: {
    fullName: string;
    dob: string;
    bio: string;
  };
  personalDetails: {
    height: number;
    jobTitle: string;
    education: string;
    city: string;
    hometown: string;
    address: string;
  };
  lifestyle: {
    drinking: string;
    smoking: string;
    exercise: string;
    diet: string;
    pets: string;
    religion: string;
  };
  interests: string[];
  preferences: {
    lookingForGenders: string[];
    relationshipGoals: string[];
    ageRange: { min: number; max: number };
    maxDistance: number;
  };
}

export interface AnalyzeProfileResponse {
  profileScore: number;
  photos: {
    score: number;
    feedback: string[];
  };
  bio: {
    score: number;
    feedback: string[];
    improvedExample: string;
  };
  personalDetails: {
    score: number;
    feedback: string[];
  };
  lifestyle: {
    score: number;
    feedback: string[];
  };
  interests: {
    score: number;
    feedback: string[];
    suggestions: string[];
  };
  preferences: {
    score: number;
    feedback: string[];
  };
  overallTips: string[];
}

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

export interface AiResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
  model: string;
}
