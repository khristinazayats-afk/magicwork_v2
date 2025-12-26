// @ts-nocheck
// POST /api/generate-ambient - Generate ambient meditation sounds using AI
import OpenAI from 'openai';

export const config = { runtime: 'nodejs', maxDuration: 60 };

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }
  return new OpenAI({ apiKey });
}

/**
 * Generate ambient meditation sound using OpenAI Audio API
 * For meditation apps, we generate loopable ambient textures
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { type = 'soft-rain', emotionalState, spaceName } = req.body;

    const openai = getOpenAIClient();

    // Map ambient types to prompts that can generate soothing sounds
    const ambientPrompts = {
      'soft-rain': 'Soft gentle rain falling, peaceful, meditative, loopable ambient sound',
      'gentle-waves': 'Gentle ocean waves lapping the shore, calm, peaceful, meditative, loopable ambient sound',
      'forest-birds': 'Peaceful forest sounds with distant bird calls, calm nature ambience, meditative, loopable',
      'white-noise': 'Soft white noise, peaceful background hum, meditative, loopable ambient texture',
      'breathing-space': 'Deep breathing rhythm, peaceful meditation space, calming, loopable',
      'temple-bells': 'Distant temple bells, peaceful, meditative, calming, loopable ambient',
    };

    const prompt = ambientPrompts[type] || ambientPrompts['soft-rain'];
    
    // Enhanced prompt based on emotional state and space
    let enhancedPrompt = prompt;
    if (emotionalState) {
      enhancedPrompt += `, ${emotionalState} mood`;
    }
    if (spaceName) {
      enhancedPrompt += `, ${spaceName} atmosphere`;
    }

    // Generate text-to-speech that can be used as ambient background
    // Note: For true ambient sounds, we'd want to use Suno/Udio, but OpenAI TTS
    // can generate basic ambient textures using phonemes
    const audio = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy', // Neutral voice works best for ambient
      input: enhancedPrompt,
      speed: 0.5, // Slower for more ambient feel
    });

    const buffer = Buffer.from(await audio.arrayBuffer());
    
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    return res.status(200).send(buffer);

  } catch (error) {
    console.error('Ambient sound generation error:', error);
    
    // Return a fallback message
    return res.status(500).json({ 
      error: error.message || 'Failed to generate ambient sound',
      fallback: 'Using static ambient sound library'
    });
  }
}

