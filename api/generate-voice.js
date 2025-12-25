// @ts-nocheck
// POST /api/generate-voice - Generate voice narration using OpenAI TTS
import OpenAI from 'openai';

export const config = { runtime: 'nodejs' };

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }
  return new OpenAI({ apiKey });
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, voice = 'nova' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const openai = getOpenAIClient();

    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voice, // nova, alloy, echo, fable, onyx, shimmer
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    
    res.setHeader('Content-Type', 'audio/mpeg');
    return res.status(200).send(buffer);

  } catch (error) {
    console.error('Voice generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate voice',
      message: error.message 
    });
  }
}




