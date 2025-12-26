// @ts-nocheck
// POST /api/generate-voice - Generate voice narration using Hugging Face Inference API
// Supports multiple TTS models on Hugging Face

export const config = { runtime: 'nodejs' };

/**
 * Generate voice narration using Hugging Face Inference API
 * 
 * Available TTS models:
 * - "microsoft/speecht5_tts" - High quality TTS
 * - "espnet/kan-bayashi_ljspeech_vits" - Fast, natural voices
 * - "facebook/mms-tts" - Multilingual support
 * 
 * Documentation: https://huggingface.co/docs/api-inference/index
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { text, voice = 'default' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const hfApiKey = process.env.HF_API_KEY || process.env.HUGGINGFACE_API_KEY;
    if (!hfApiKey) {
      return res.status(500).json({ 
        error: 'HF_API_KEY not configured',
        message: 'Please set HF_API_KEY in Vercel environment variables'
      });
    }

    // Use Microsoft SpeechT5 for high-quality TTS
    const modelId = 'microsoft/speecht5_tts';
    
    const hfResponse = await fetch(
      `https://api-inference.huggingface.co/models/${modelId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text,
          // SpeechT5 may require speaker embeddings or additional parameters
          // Check model documentation for specific requirements
        }),
      }
    );

    if (!hfResponse.ok) {
      if (hfResponse.status === 503) {
        const errorData = await hfResponse.json().catch(() => ({}));
        return res.status(503).json({ 
          error: 'Model is loading, please try again in a few seconds',
          estimated_time: errorData.estimated_time || 20
        });
      }
      
      const errorText = await hfResponse.text();
      console.error('Hugging Face TTS error:', hfResponse.status, errorText);
      throw new Error(`Hugging Face API error: ${hfResponse.status}`);
    }

    // Hugging Face returns audio as binary (WAV format typically)
    const audioBuffer = await hfResponse.arrayBuffer();
    const buffer = Buffer.from(audioBuffer);
    
    res.setHeader('Content-Type', 'audio/wav');
    return res.status(200).send(buffer);

  } catch (error) {
    console.error('Voice generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate voice',
      message: error.message 
    });
  }
}
