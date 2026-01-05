// @ts-nocheck
// POST /api/generate-voice - Generate voice narration using Hugging Face Inference API
// Supports multiple TTS models on Hugging Face

export const config = { runtime: 'nodejs' };

/**
 * Generate voice narration with multiple TTS providers
 * 
 * Providers (in order of preference):
 * 1. ElevenLabs - Premium quality, natural voices (primary)
 * 2. OpenAI TTS - Good quality, fast (fallback)
 * 3. Hugging Face - Limited availability
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { 
      text, 
      voice = 'default',
      emotionalState = 'neutral',
      intent = 'reduce_stress',
      tone = 'warm',
      pace = 'slow',
      stability = 0.8
    } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const hfApiKey = process.env.HF_API_KEY || process.env.HUGGINGFACE_API_KEY;
    
    // Prefer ElevenLabs for best quality meditation voice
    if (elevenlabsApiKey) {
      return await generateWithElevenLabs(elevenlabsApiKey, text, voice, emotionalState, intent, tone, pace, stability, res);
    }
    
    // Fallback to OpenAI TTS
    if (openaiApiKey) {
      return await generateWithOpenAI(openaiApiKey, text, voice, emotionalState, intent, tone, pace, stability, res);
    }
    
    if (!hfApiKey) {
      return res.status(500).json({ 
        error: 'No API key configured',
        message: 'Please set ELEVENLABS_API_KEY (preferred), OPENAI_API_KEY, or HF_API_KEY'
      });
    }

    // Last resort: HF (likely to fail with old API)
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

// ElevenLabs TTS generation (primary - best quality for meditation)
async function generateWithElevenLabs(apiKey, text, voice, emotionalState, intent, tone, pace, stability, res) {
  try {
    // ElevenLabs voice IDs - Male and Female voices
    const maleVoices = {
      'default': 'pNInz6obpgDQGcFmaJgB', // Adam - calm, soothing
      'clear': 'ErXwobaYiN019PkySvjV',    // Antoni - clear, professional
      'grounding': 'pNInz6obpgDQGcFmaJgB', // Adam - grounding
      'energetic': 'ErXwobaYiN019PkySvjV',  // Antoni - energetic
      'gentle': 'pNInz6obpgDQGcFmaJgB'     // Adam - gentle
    };
    
    const femaleVoices = {
      'default': 'EXAVITQu4vr4xnSDxMaL', // Sarah - warm, gentle
      'warm': 'EXAVITQu4vr4xnSDxMaL',     // Sarah
      'calm': '21m00Tcm4TlvDq8ikWAM',     // Rachel - calm, soothing
      'soothing': '21m00Tcm4TlvDq8ikWAM', // Rachel - very soothing
      'very_calm': '21m00Tcm4TlvDq8ikWAM', // Rachel - extremely calm
      'extremely_calm': '21m00Tcm4TlvDq8ikWAM', // Rachel - extremely calm
      'balanced': 'EXAVITQu4vr4xnSDxMaL'   // Sarah - balanced
    };
    
    // Select voice based on gender preference
    const isMale = voice === 'clear' || voice === 'male';
    const voiceMap = isMale ? maleVoices : femaleVoices;
    const selectedVoiceId = voiceMap[tone] || voiceMap['default'];
    
    // Adjust pace based on emotional state and intent
    let speed = 1.0;
    if (pace === 'very_slow') speed = 0.85;
    else if (pace === 'slow') speed = 0.9;
    else if (pace === 'moderate') speed = 0.95;
    
    // Adjust stability based on emotional state (more anxious = more stable voice)
    const adjustedStability = Math.min(0.98, Math.max(0.7, stability));
    
    const elevenlabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: adjustedStability,  // Dynamic based on emotional state
            similarity_boost: 0.8,        // Natural voice quality
            style: tone === 'energetic' ? 0.5 : 0.3, // More expression for energy, subtle for calm
            use_speaker_boost: true
          }
        }),
      }
    );

    if (!elevenlabsResponse.ok) {
      const errorText = await elevenlabsResponse.text();
      console.error('ElevenLabs TTS error:', elevenlabsResponse.status, errorText);
      throw new Error(`ElevenLabs TTS error: ${elevenlabsResponse.status}`);
    }

    const audioBuffer = await elevenlabsResponse.arrayBuffer();
    const buffer = Buffer.from(audioBuffer);
    
    res.setHeader('Content-Type', 'audio/mpeg');
    return res.status(200).send(buffer);
    
  } catch (error) {
    console.error('ElevenLabs voice generation error:', error);
    throw error;
  }
}

// OpenAI TTS generation (fallback - good quality, fast)
async function generateWithOpenAI(apiKey, text, voice, emotionalState, intent, tone, pace, stability, res) {
  try {
    // OpenAI voices - Male and Female
    const maleVoices = {
      'default': 'alloy',
      'clear': 'alloy',
      'grounding': 'alloy',
      'energetic': 'echo',
      'gentle': 'alloy'
    };
    
    const femaleVoices = {
      'default': 'shimmer',
      'warm': 'nova',
      'calm': 'shimmer',
      'soothing': 'shimmer',
      'very_calm': 'shimmer',
      'extremely_calm': 'shimmer',
      'balanced': 'nova'
    };
    
    // Select voice based on gender preference
    const isMale = voice === 'clear' || voice === 'male';
    const voiceMap = isMale ? maleVoices : femaleVoices;
    const selectedVoice = voiceMap[tone] || voiceMap['default'];
    
    // Adjust speed based on pace
    let speed = 1.0;
    if (pace === 'very_slow') speed = 0.85;
    else if (pace === 'slow') speed = 0.9;
    else if (pace === 'moderate') speed = 0.95;
    
    const openaiResponse = await fetch(
      'https://api.openai.com/v1/audio/speech',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: selectedVoice,
          speed: speed // Dynamic speed based on emotional state and intent
        }),
      }
    );

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI TTS error:', openaiResponse.status, errorText);
      throw new Error(`OpenAI TTS error: ${openaiResponse.status}`);
    }

    const audioBuffer = await openaiResponse.arrayBuffer();
    const buffer = Buffer.from(audioBuffer);
    
    res.setHeader('Content-Type', 'audio/mpeg');
    return res.status(200).send(buffer);
    
  } catch (error) {
    console.error('OpenAI voice generation error:', error);
    throw error;
  }
}
