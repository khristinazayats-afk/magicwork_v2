// @ts-nocheck
// POST /api/generate-ambient - Generate ambient meditation sounds using Hugging Face Inference API
// Hugging Face provides access to multiple audio generation models through their unified Inference API

export const config = { runtime: 'nodejs', maxDuration: 60 };

/**
 * Generate ambient meditation sound using Hugging Face Inference API
 * 
 * Models available:
 * - "facebook/musicgen-small" - Music generation
 * - "facebook/audiocraft" - Audio generation
 * - "facebook/musicgen-medium" - Higher quality music
 * - "facebook/text2music" - Text-to-music
 * 
 * API Documentation: https://huggingface.co/docs/api-inference/index
 * Requires: HF_API_KEY (Hugging Face API token) environment variable in Vercel
 * Get your token: https://huggingface.co/settings/tokens
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { type = 'soft-rain', emotionalState, spaceName } = req.body;

    const hfApiKey = process.env.HF_API_KEY || process.env.HUGGINGFACE_API_KEY;
    if (!hfApiKey) {
      // Fallback to CDN if API key not configured
      console.warn('HF_API_KEY not set, using CDN fallback');
      const cdnBase = 'https://d3hajr7xji31qq.cloudfront.net';
      return res.status(200).json({ 
        audioUrl: `${cdnBase}/ambient/${type}.mp3`,
        type,
        note: 'HF_API_KEY not configured - using CDN fallback. Get your token: https://huggingface.co/settings/tokens'
      });
    }

    // Map ambient types to prompts for Hugging Face models
    const ambientPrompts = {
      'soft-rain': 'gentle rain falling softly, peaceful meditation ambiance, calm weather sounds, ambient nature',
      'gentle-waves': 'ocean waves gently lapping the shore, calm seaside meditation atmosphere, peaceful water sounds, ambient ocean',
      'forest-birds': 'peaceful forest with distant bird calls, nature meditation ambiance, calm woodland sounds, ambient nature',
      'white-noise': 'soft ambient background white noise, peaceful meditation space, calming static, ambient soundscape',
      'breathing-space': 'deep breathing meditation rhythm, peaceful breathing sounds, calm meditation space, ambient breathing',
      'temple-bells': 'distant peaceful temple bells, meditation atmosphere, calm spiritual sounds, ambient meditation',
    };

    let prompt = ambientPrompts[type] || ambientPrompts['soft-rain'];
    
    // Enhance prompt based on context
    if (emotionalState) {
      prompt += `, ${emotionalState} mood`;
    }
    if (spaceName) {
      prompt += `, ${spaceName} atmosphere`;
    }

    // Use Facebook's MusicGen model via Hugging Face Inference API
    // This model generates music/audio from text descriptions
    const modelId = 'facebook/musicgen-small'; // Lightweight model for faster generation
    
    const hfResponse = await fetch(
      `https://api-inference.huggingface.co/models/${modelId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            duration: 10, // 10 seconds (can be looped)
            top_k: 250,
            top_p: 0.0,
            temperature: 1.0,
            classifier_free_guidance: 3.0,
          },
        }),
      }
    );

    if (!hfResponse.ok) {
      // Handle model loading (first request can take time)
      if (hfResponse.status === 503) {
        const errorData = await hfResponse.json().catch(() => ({}));
        return res.status(503).json({ 
          error: 'Model is loading, please try again in a few seconds',
          estimated_time: errorData.estimated_time || 20,
          retry_after: errorData.estimated_time || 20
        });
      }
      
      const errorText = await hfResponse.text();
      console.error('Hugging Face API error:', hfResponse.status, errorText);
      throw new Error(`Hugging Face API error: ${hfResponse.status}`);
    }

    // Hugging Face returns audio as binary (WAV format)
    const audioBuffer = await hfResponse.arrayBuffer();
    
    // Convert to base64 for client-side playback
    // Or return as blob URL (we'll return base64 data URL)
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    const audioDataUrl = `data:audio/wav;base64,${base64Audio}`;
    
    // For production, you might want to upload to S3 and return CDN URL
    // For now, we'll return the data URL (works but not ideal for large files)
    return res.status(200).json({ 
      audioUrl: audioDataUrl,
      type,
      prompt,
      provider: 'huggingface',
      model: modelId,
      format: 'wav'
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
