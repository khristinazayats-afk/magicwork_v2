// @ts-nocheck
// POST /api/generate-image - Generate images using Hugging Face (primary) or OpenAI (fallback)

export const config = { runtime: 'nodejs' };

/**
 * Generate images using Hugging Face Inference API (primary) or OpenAI DALL-E (fallback)
 * 
 * Hugging Face models:
 * - "stabilityai/stable-diffusion-xl-base-1.0" - High quality (current)
 * 
 * OpenAI models:
 * - "dall-e-3" - Fallback option
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'prompt is required and must be a non-empty string' });
    }

    // Enhance prompt for meditation/mindfulness context
    const enhancedPrompt = prompt.includes('meditation') || prompt.includes('mindful') || prompt.includes('calm')
      ? prompt
      : `${prompt}, meditation, mindfulness, peaceful, serene, calming atmosphere`;

    // Enhance prompt for meditation/mindfulness context
    const enhancedPrompt = prompt.includes('meditation') || prompt.includes('mindful') || prompt.includes('calm')
      ? prompt
      : `${prompt}, meditation, mindfulness, peaceful, serene, calming atmosphere`;

    const hfApiKey = process.env.HF_API_KEY || process.env.HUGGINGFACE_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    // Try Hugging Face first, fallback to OpenAI
    if (hfApiKey) {
      return await generateWithHuggingFace(hfApiKey, enhancedPrompt, res);
    } else if (openaiApiKey) {
      return await generateWithOpenAI(openaiApiKey, enhancedPrompt, res);
    } else {
      return res.status(500).json({ 
        error: 'No API key configured',
        message: 'Please set HF_API_KEY (preferred) or OPENAI_API_KEY (fallback) in Vercel'
      });
    }
  } catch (error) {
    console.error('Error generating image:', error);
    return res.status(500).json({
      error: 'Failed to generate image',
      message: error.message
    });
  }
}

// Hugging Face generation (primary) - TODO: Switch to FLUX.1-dev via Inference Providers
async function generateWithHuggingFace(hfApiKey, prompt, res) {
  const modelId = 'stabilityai/stable-diffusion-xl-base-1.0';
  
  // NOTE: Using old endpoint temporarily - will migrate to Inference Providers
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
          num_inference_steps: 30,
          guidance_scale: 7.5,
          width: 1024,
          height: 1024,
        },
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
    throw new Error(`Hugging Face API error: ${hfResponse.status}`);
  }

  const imageBuffer = await hfResponse.arrayBuffer();
  const base64Image = Buffer.from(imageBuffer).toString('base64');
  const imageDataUrl = `data:image/png;base64,${base64Image}`;
  
  return res.status(200).json({
    imageUrl: imageDataUrl,
    prompt,
    provider: 'huggingface',
    model: modelId
  });
}

// OpenAI generation (fallback)
async function generateWithOpenAI(openaiApiKey, prompt, res) {
  const { default: OpenAI } = await import('openai');
  const openai = new OpenAI({ apiKey: openaiApiKey });

  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: prompt,
    n: 1,
    size: '1024x1024',
    quality: 'standard',
    style: 'natural',
  });

  const imageUrl = response.data[0]?.url;
  const revisedPrompt = response.data[0]?.revised_prompt;

  if (!imageUrl) {
    return res.status(500).json({ error: 'Failed to generate image' });
  }

  return res.status(200).json({
    imageUrl,
    prompt,
    revisedPrompt: revisedPrompt || prompt,
    provider: 'openai',
    model: 'dall-e-3'
  });
}
