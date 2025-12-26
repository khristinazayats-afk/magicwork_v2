// @ts-nocheck
// POST /api/generate-image - Generate images using Hugging Face Inference API
// Supports multiple models: Stable Diffusion, FLUX, etc.

export const config = { runtime: 'nodejs' };

/**
 * Generate images using Hugging Face Inference API
 * 
 * Available models:
 * - "stabilityai/stable-diffusion-xl-base-1.0" - High quality (current)
 * - "runwayml/stable-diffusion-v1-5" - Fast, good quality
 * - "black-forest-labs/FLUX.1-dev" - Latest FLUX model (premium)
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
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'prompt is required and must be a non-empty string' });
    }

    const hfApiKey = process.env.HF_API_KEY || process.env.HUGGINGFACE_API_KEY;
    if (!hfApiKey) {
      return res.status(500).json({ 
        error: 'HF_API_KEY not configured',
        message: 'Please set HF_API_KEY in Vercel environment variables'
      });
    }

    // Enhance prompt for meditation/mindfulness context
    const enhancedPrompt = prompt.includes('meditation') || prompt.includes('mindful') || prompt.includes('calm')
      ? prompt
      : `${prompt}, meditation, mindfulness, peaceful, serene, calming atmosphere`;

    // Use Stable Diffusion XL for high-quality images
    const modelId = 'stabilityai/stable-diffusion-xl-base-1.0';
    
    const hfResponse = await fetch(
      `https://api-inference.huggingface.co/models/${modelId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: enhancedPrompt,
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
      // Handle model loading (first request can take time)
      if (hfResponse.status === 503) {
        const errorData = await hfResponse.json().catch(() => ({}));
        return res.status(503).json({ 
          error: 'Model is loading, please try again in a few seconds',
          estimated_time: errorData.estimated_time || 20
        });
      }
      
      const errorText = await hfResponse.text();
      console.error('Hugging Face API error:', hfResponse.status, errorText);
      throw new Error(`Hugging Face API error: ${hfResponse.status}`);
    }

    // Hugging Face returns image as binary (PNG format)
    const imageBuffer = await hfResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const imageDataUrl = `data:image/png;base64,${base64Image}`;
    
    return res.status(200).json({
      imageUrl: imageDataUrl,
      prompt: enhancedPrompt,
      provider: 'huggingface',
      model: modelId
    });

  } catch (error) {
    console.error('Error generating image:', error);
    return res.status(500).json({
      error: 'Failed to generate image',
      message: error.message
    });
  }
}
