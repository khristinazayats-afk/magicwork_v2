// @ts-nocheck
// POST /api/generate-video - Generate videos using OpenAI (or fallback to image generation)
// Note: OpenAI doesn't have video generation yet, so this uses image generation as a fallback
// When OpenAI releases video generation, this endpoint can be updated
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

// Generate video based on prompt
// NOTE: OpenAI doesn't support video generation yet, so this returns a placeholder
// or uses image generation as a fallback. Update when video generation is available.
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

    // NOTE: OpenAI doesn't have video generation yet (as of 2024)
    // This is a placeholder that returns an error with helpful message
    // When OpenAI releases video generation API, update this endpoint
    
    return res.status(501).json({
      error: 'Video generation not yet available',
      message: 'OpenAI does not currently support video generation. This endpoint will be updated when video generation becomes available.',
      suggestion: 'Use /api/generate-image to generate static images, or integrate with other video generation services like RunwayML, Pika Labs, or Stable Video Diffusion.',
      prompt: prompt
    });

    // FUTURE: When OpenAI video generation is available, uncomment and use this:
    /*
    const openai = getOpenAIClient();

    // Generate video using OpenAI video generation (when available)
    const response = await openai.videos.generate({
      model: 'video-model-name', // Update when available
      prompt: prompt,
      // ... other parameters
    });

    const videoUrl = response.data[0]?.url;

    if (!videoUrl) {
      return res.status(500).json({ error: 'Failed to generate video' });
    }

    return res.status(200).json({
      videoUrl,
      prompt: prompt
    });
    */

  } catch (error) {
    console.error('Error generating video:', error);
    
    // Handle OpenAI API errors
    if (error instanceof OpenAI.APIError) {
      return res.status(error.status || 500).json({
        error: 'OpenAI API error',
        message: error.message,
        type: error.type
      });
    }

    return res.status(500).json({
      error: 'Failed to generate video',
      message: error.message
    });
  }
}


