// @ts-nocheck
// POST /api/generate-preview - Generate guided meditation preview images using Hugging Face

export const config = { runtime: 'nodejs' };

/**
 * Generate a preview image for a guided meditation using Hugging Face Inference API.
 * Uses Stable Diffusion XL for high-quality thumbnails.
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { emotionalState, intent, spaceName } = req.body || {};

    const hfApiKey = process.env.HF_API_KEY || process.env.HUGGINGFACE_API_KEY;
    if (!hfApiKey) {
      return res.status(500).json({ 
        error: 'HF_API_KEY not configured',
        message: 'Please set HF_API_KEY in environment variables'
      });
    }

    const modelId = 'stabilityai/stable-diffusion-xl-base-1.0';

    const promptParts = [
      'minimalist, serene, guided meditation preview artwork',
      emotionalState ? `${emotionalState} mood` : null,
      intent ? `${intent} theme` : null,
      spaceName ? `${spaceName} atmosphere` : null,
      'soft gradients, gentle light, no text, high aesthetic, editorial quality'
    ].filter(Boolean);

    const prompt = promptParts.join(', ');

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
      provider: 'huggingface',
      model: modelId,
      prompt
    });

  } catch (error) {
    console.error('Preview generation error:', error);
    return res.status(500).json({ error: error.message });
  }
}
