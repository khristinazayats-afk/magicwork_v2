// @ts-nocheck
// POST /api/generate-image - Generate images using OpenAI DALL-E
import OpenAI from 'openai';

export const config = { runtime: 'nodejs' };

// Initialize OpenAI client
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }
  return new OpenAI({ apiKey });
}

// Generate image based on prompt
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;

    // Validate inputs
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'prompt is required and must be a non-empty string' });
    }

    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY environment variable is not set');
      return res.status(500).json({ 
        error: 'OpenAI API key not configured',
        message: 'Please set OPENAI_API_KEY in Vercel environment variables'
      });
    }

    const openai = getOpenAIClient();

    // Enhance prompt for meditation/mindfulness context if not already specific
    const enhancedPrompt = prompt.includes('meditation') || prompt.includes('mindful') || prompt.includes('calm')
      ? prompt
      : `${prompt}, meditation, mindfulness, peaceful, serene, calming atmosphere`;

    // Generate image using DALL-E 3
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: enhancedPrompt,
      n: 1, // Generate 1 image
      size: '1024x1024', // Standard size, can be '1024x1792' or '1792x1024' for different ratios
      quality: 'standard', // 'standard' or 'hd'
      style: 'natural', // 'vivid' or 'natural'
    });

    const imageUrl = response.data[0]?.url;
    const revisedPrompt = response.data[0]?.revised_prompt;

    if (!imageUrl) {
      return res.status(500).json({ error: 'Failed to generate image' });
    }

    return res.status(200).json({
      imageUrl,
      prompt: enhancedPrompt,
      revisedPrompt: revisedPrompt || enhancedPrompt
    });

  } catch (error) {
    console.error('Error generating image:', error);
    
    // Handle OpenAI API errors
    if (error instanceof OpenAI.APIError) {
      return res.status(error.status || 500).json({
        error: 'OpenAI API error',
        message: error.message,
        type: error.type
      });
    }

    return res.status(500).json({
      error: 'Failed to generate image',
      message: error.message
    });
  }
}









