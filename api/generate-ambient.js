// @ts-nocheck
// POST /api/generate-ambient - Generate ambient meditation sounds using Fal.ai API
// Fal.ai provides a Sound Effect Generation API that creates professional ambient sounds

export const config = { runtime: 'nodejs', maxDuration: 60 };

/**
 * Generate ambient meditation sound using Fal.ai Sound Effect Generation API
 * 
 * API Documentation: https://fal.ai/models/beatoven/sound-effect-generation/api
 * Requires: FAL_API_KEY environment variable in Vercel
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { type = 'soft-rain', emotionalState, spaceName } = req.body;

    const falApiKey = process.env.FAL_API_KEY;
    if (!falApiKey) {
      // Fallback to CDN if API key not configured
      console.warn('FAL_API_KEY not set, using CDN fallback');
      const cdnBase = 'https://d3hajr7xji31qq.cloudfront.net';
      return res.status(200).json({ 
        audioUrl: `${cdnBase}/ambient/${type}.mp3`,
        type,
        note: 'FAL_API_KEY not configured - using CDN fallback'
      });
    }

    // Map ambient types to prompts for Fal.ai
    const ambientPrompts = {
      'soft-rain': 'gentle rain falling softly, peaceful meditation ambiance, calm weather sounds',
      'gentle-waves': 'ocean waves gently lapping the shore, calm seaside meditation atmosphere, peaceful water sounds',
      'forest-birds': 'peaceful forest with distant bird calls, nature meditation ambiance, calm woodland sounds',
      'white-noise': 'soft ambient background white noise, peaceful meditation space, calming static',
      'breathing-space': 'deep breathing meditation rhythm, peaceful breathing sounds, calm meditation space',
      'temple-bells': 'distant peaceful temple bells, meditation atmosphere, calm spiritual sounds',
    };

    let prompt = ambientPrompts[type] || ambientPrompts['soft-rain'];
    
    // Enhance prompt based on context
    if (emotionalState) {
      prompt += `, ${emotionalState} mood`;
    }
    if (spaceName) {
      prompt += `, ${spaceName} atmosphere`;
    }

    // Call Fal.ai Sound Effect Generation API
    // Model: beatoven/sound-effect-generation
    const falResponse = await fetch('https://fal.run/fal-ai/beatoven/sound-effect-generation', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        duration: 10, // 10 seconds (can be looped)
        format: 'mp3',
      }),
    });

    if (!falResponse.ok) {
      const errorText = await falResponse.text();
      console.error('Fal.ai API error:', falResponse.status, errorText);
      throw new Error(`Fal.ai API error: ${falResponse.status}`);
    }

    const falData = await falResponse.json();
    
    // Fal.ai returns the audio file URL or base64 data
    // The response format may vary, so we handle both cases
    let audioUrl = null;
    
    if (falData.audio_url) {
      audioUrl = falData.audio_url;
    } else if (falData.audio) {
      audioUrl = falData.audio;
    } else if (falData.output && falData.output.audio_url) {
      audioUrl = falData.output.audio_url;
    } else if (falData.output && falData.output.audio) {
      audioUrl = falData.output.audio;
    }

    if (!audioUrl) {
      console.error('Fal.ai response format unexpected:', falData);
      throw new Error('Unexpected response format from Fal.ai');
    }

    return res.status(200).json({ 
      audioUrl,
      type,
      prompt,
      provider: 'fal.ai'
    });

  } catch (error) {
    console.error('Ambient sound generation error:', error);
    
    // Fallback to CDN if generation fails
    const cdnBase = 'https://d3hajr7xji31qq.cloudfront.net';
    return res.status(200).json({ 
      audioUrl: `${cdnBase}/ambient/${req.body?.type || 'soft-rain'}.mp3`,
      type: req.body?.type || 'soft-rain',
      error: error.message,
      fallback: true
    });
  }
}
