// @ts-nocheck
// POST /api/generate-video - Generate cinematic meditation backgrounds using OpenAI Sora 2
import OpenAI from 'openai';

export const config = { 
  runtime: 'nodejs',
  maxDuration: 60 
};

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }
  return new OpenAI({ apiKey });
}

/**
 * Generate a cinematic, calming video.
 * Supports "start" (current state) and "end" (goal state) for visual journeys.
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { emotionalState, intent, spaceName, stage = 'start' } = req.body;

    const openai = getOpenAIClient();

    let videoPrompt = '';
    
    if (stage === 'start') {
      // Visualizing "Where they are" - often more textured, slightly more movement/complexity
      videoPrompt = `A cinematic meditation background representing the current state of ${emotionalState}. 
        Visual elements: ${emotionalState === 'anxious' || emotionalState === 'very_anxious' ? 'swirling abstract mists, dense textures, slightly rapid but organic motion' : 'soft neutral tones, quiet atmosphere'}.
        Space: ${spaceName}. Style: Ultra-HD, 4K, ethereal lighting, shallow depth of field. 
        No people, no text. Seamless loop.`;
    } else {
      // Visualizing "Where they want to be" - the Destination/Intent
      videoPrompt = `A cinematic meditation background representing the goal of ${intent}. 
        Visual elements: ${intent === 'better_sleep' ? 'deep indigo night sky, twinkling soft stars' : 
                          intent === 'reduce_stress' ? 'golden morning light, soft floating particles, clear horizon' : 
                          'pure minimalist serenity'}.
        Space: ${spaceName}. Style: Ultra-HD, 4K, golden hour lighting, extremely slow motion. 
        Peaceful, clear, expansive. Seamless loop.`;
    }

    console.log(`[API] Generating ${stage} video for journey...`);

    const response = await openai.videos.generate({
      model: 'sora-2',
      prompt: videoPrompt,
      size: '1024x1792',
      quality: 'hd',
      duration: 10,
      loop: true
    });

    return res.status(200).json({
      videoUrl: response.data[0]?.url,
      stage,
      prompt: videoPrompt
    });

  } catch (error) {
    console.error('Error generating video:', error);
    return res.status(500).json({ error: error.message });
  }
}
