import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest',
    enabled: true, // Always enabled as per request
    timeout: parseInt(process.env.AI_TIMEOUT || '15000'), // Default to 15s
  },
};

if (!config.gemini.apiKey) {
  console.warn('WARNING: GEMINI_API_KEY is not set in environment variables.');
}
