// @ts-nocheck
// POST /api/generate-video - Generate cinematic meditation backgrounds using Hugging Face Inference API
// Supports video generation models on Hugging Face

export const config = { 
  runtime: 'nodejs',
  maxDuration: 300 // Allow up to 5 minutes for true video generation
};

/**
 * Generate cinematic meditation backgrounds
 * 
 * Options (in order of preference):
 * 1. OpenAI DALL-E 3 - HD static images ($0.04/image, animated client-side) - DEFAULT
 * 2. Replicate Video - True video generation ($0.05-0.10/sec, 4-8 sec clips) - OPTIONAL
 * 
 * Set USE_VIDEO_GENERATION=true in Vercel to enable true video (expensive!)
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { emotionalState, intent, spaceName, stage = 'start' } = req.body;

    const openaiApiKey = process.env.OPENAI_API_KEY;
    const replicateApiKey = process.env.REPLICATE_API_KEY;
    const useVideoGeneration = process.env.USE_VIDEO_GENERATION === 'true';
    
    if (!openaiApiKey && !replicateApiKey) {
      return res.status(500).json({ 
        error: 'No API key configured',
        message: 'Please set OPENAI_API_KEY or REPLICATE_API_KEY in Vercel'
      });
    }

    let videoPrompt = '';
    
    if (stage === 'start') {
      videoPrompt = `A cinematic meditation background representing the current state of ${emotionalState}. 
        Visual elements: ${emotionalState === 'anxious' || emotionalState === 'very_anxious' ? 'swirling abstract mists, dense textures, slightly rapid but organic motion' : 'soft neutral tones, quiet atmosphere'}.
        Space: ${spaceName}. Style: Ultra-HD, 4K, ethereal lighting, shallow depth of field. 
        No people, no text. Seamless loop.`;
    } else {
      videoPrompt = `A cinematic meditation background representing the goal of ${intent}. 
        Visual elements: ${intent === 'better_sleep' ? 'deep indigo night sky, twinkling soft stars' : 
                          intent === 'reduce_stress' ? 'golden morning light, soft floating particles, clear horizon' : 
                          'pure minimalist serenity'}.
        Space: ${spaceName}. Style: Ultra-HD, 4K, golden hour lighting, extremely slow motion. 
        Peaceful, clear, expansive. Seamless loop.`;
    }

    // Check if user wants true video generation (expensive!)
    if (useVideoGeneration && replicateApiKey) {
      return await generateVideoWithReplicate(replicateApiKey, videoPrompt, stage, res);
    }

    // Default: Use OpenAI for HD static images (animated client-side)
    if (openaiApiKey) {
      return await generateWithOpenAI(openaiApiKey, videoPrompt, stage, res);
    }

    // Fallback: HF old API (likely to fail)
    const modelId = 'black-forest-labs/FLUX.1-dev';
    
    const hfResponse = await fetch(
      'https://router.huggingface.co/v1/images/generations',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelId,
          prompt: videoPrompt,
          n: 1,
          size: '1024x1792', // Vertical format for meditation videos
          response_format: 'b64_json'
        }),
      }
    );

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      console.error('HF Inference Providers image error:', hfResponse.status, errorText);
      throw new Error(`HF Inference Providers error: ${hfResponse.status}`);
    }

    const data = await hfResponse.json();
    
    // Extract base64 image from OpenAI-compatible response
    let imageDataUrl = '';
    if (data.data && data.data[0]?.b64_json) {
      imageDataUrl = `data:image/png;base64,${data.data[0].b64_json}`;
    } else if (data.data && data.data[0]?.url) {
      imageDataUrl = data.data[0].url;
    } else {
      console.error('Unexpected Inference Providers image response:', data);
      throw new Error('Unexpected response format');
    }

    return res.status(200).json({
      videoUrl: imageDataUrl,
      stage,
      prompt: videoPrompt,
      provider: 'huggingface-inference-providers',
      model: modelId,
      note: 'Stunning FLUX.1-dev image (animated client-side). True video would cost $1-2 per generation vs $0.005 for this.'
    });

  } catch (error) {
    console.error('Error generating video:', error);
    return res.status(500).json({ error: error.message });
  }
}

// OpenAI DALL-E 3 generation (primary - best quality for meditation images)
async function generateWithOpenAI(apiKey, prompt, stage, res) {
  try {
    const openaiResponse = await fetch(
      'https://api.openai.com/v1/images/generations',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: '1024x1792',
          quality: 'hd',
          style: 'natural'
        }),
      }
    );

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI DALL-E error:', openaiResponse.status, errorText);
      throw new Error(`OpenAI DALL-E error: ${openaiResponse.status}`);
    }

    const data = await openaiResponse.json();
    
    if (!data.data || !data.data[0]?.url) {
      throw new Error('No image URL in OpenAI response');
    }

    return res.status(200).json({
      videoUrl: data.data[0].url,
      stage,
      prompt: data.data[0].revised_prompt || prompt,
      provider: 'openai-dalle3',
      model: 'dall-e-3',
      type: 'image',
      note: 'HD meditation image (animated client-side with CSS). Set USE_VIDEO_GENERATION=true for true video.'
    });
    
  } catch (error) {
    console.error('OpenAI video generation error:', error);
    throw error;
  }
}

// Replicate video generation (optional - expensive but true video!)
async function generateVideoWithReplicate(apiKey, prompt, stage, res) {
  try {
    // Using Stable Video Diffusion or similar text-to-video model
    const replicateResponse = await fetch(
      'https://api.replicate.com/v1/predictions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: 'b7d8c1a0d4d6e1e1e1e1e1e1e1e1e1e1', // Replace with actual model version
          input: {
            prompt: prompt,
            num_frames: 120,      // 4 seconds at 30fps
            num_inference_steps: 25,
            fps: 30,
            motion_bucket_id: 127 // Medium motion
          }
        }),
      }
    );

    if (!replicateResponse.ok) {
      const errorText = await replicateResponse.text();
      console.error('Replicate error:', replicateResponse.status, errorText);
      throw new Error(`Replicate error: ${replicateResponse.status}`);
    }

    const prediction = await replicateResponse.json();
    
    // Poll for completion (Replicate is async)
    let videoUrl = null;
    for (let i = 0; i < 60; i++) { // Max 5 minutes (60 * 5 seconds)
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            'Authorization': `Token ${apiKey}`,
          }
        }
      );
      
      const status = await statusResponse.json();
      
      if (status.status === 'succeeded') {
        videoUrl = status.output;
        break;
      } else if (status.status === 'failed') {
        throw new Error('Video generation failed');
      }
    }
    
    if (!videoUrl) {
      throw new Error('Video generation timed out');
    }

    return res.status(200).json({
      videoUrl,
      stage,
      prompt,
      provider: 'replicate',
      model: 'stable-video-diffusion',
      type: 'video',
      duration: 4,
      note: 'True video generation (4 seconds, ~$0.40 per video)'
    });
    
  } catch (error) {
    console.error('Replicate video generation error:', error);
    // Fallback to OpenAI images if video fails
    throw error;
  }
}
