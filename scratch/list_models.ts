import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('ERROR: GEMINI_API_KEY not found in .env file');
  process.exit(1);
}

async function listModels() {
  try {
    const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    console.log(JSON.stringify(response.data.models.map(m => m.name), null, 2));
  } catch (error) {
    console.error('Error listing models:', error.response?.data || error.message);
  }
}

listModels();
