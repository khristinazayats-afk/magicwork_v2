// @ts-nocheck
// POST /api/generate-practice - Generate meditation practice content using Hugging Face Inference API
// Supports multiple LLM models on Hugging Face

export const config = { runtime: 'nodejs' };

/**
 * Generate meditation practice scripts using Hugging Face Inference Providers
 * 
 * Available LLM models:
 * - "meta-llama/Llama-3.1-8B-Instruct" - Fast, high quality (current)
 * - "mistralai/Mistral-7B-Instruct-v0.2" - Alternative option
 * 
 * Documentation: https://huggingface.co/docs/inference-providers/
 */
export default async function handler(req, res) {
  // Debug: Log that we're in the handler
  console.log('[generate-practice] Handler invoked, method:', req.method);
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { emotionalState, durationMinutes, intent } = req.body;
    
    console.log('[generate-practice] Request received:', { emotionalState, durationMinutes, intent });

    if (!emotionalState || typeof emotionalState !== 'string') {
      return res.status(400).json({ error: 'emotionalState is required and must be a string' });
    }

    if (!durationMinutes || typeof durationMinutes !== 'number' || durationMinutes < 1) {
      return res.status(400).json({ error: 'durationMinutes is required and must be a positive number' });
    }

    const hfApiKey = process.env.HF_API_KEY || process.env.HUGGINGFACE_API_KEY;
    if (!hfApiKey) {
      return res.status(500).json({ 
        error: 'HF_API_KEY not configured',
        message: 'Please set HF_API_KEY in Vercel environment variables'
      });
    }

    // Determine pacing based on emotional state
    const emotionalScale = ['calm', 'neutral', 'slightly_anxious', 'anxious', 'very_anxious'];
    const emotionalIndex = emotionalScale.indexOf(emotionalState.toLowerCase());
    const isAnxious = emotionalIndex >= 2;
    
    const wordsPerMinute = isAnxious ? 120 : 60;
    const totalWords = Math.floor(wordsPerMinute * durationMinutes);

    // Build intent-specific guidance
    let intentGuidance = '';
    if (intent && typeof intent === 'string') {
      const intentLower = intent.toLowerCase();
      if (intentLower.includes('stress') || intentLower.includes('anxiety')) {
        intentGuidance = 'Focus on stress relief and anxiety reduction. Include techniques for releasing tension and finding calm.';
      } else if (intentLower.includes('sleep') || intentLower.includes('rest')) {
        intentGuidance = 'Focus on relaxation and sleep preparation. Use slower pacing, body relaxation, and imagery that promotes rest.';
      } else if (intentLower.includes('focus') || intentLower.includes('concentration')) {
        intentGuidance = 'Focus on improving concentration and mental clarity. Include techniques for sustaining attention.';
      }
    }

    // Create prompt for meditation practice generation
    const prompt = `Create a ${durationMinutes}-minute guided meditation practice script for someone who is feeling ${emotionalState}${intent ? ` and wants to ${intent}` : ''}.

Guidelines:
- Target approximately ${totalWords} words total (${wordsPerMinute} words per minute)
- Use ${isAnxious ? 'gentle, reassuring, and more detailed guidance' : 'minimal, space-giving language'}
- Focus on breathwork, body awareness, and present-moment attention
- Include specific instructions for physical sensations and breath awareness
- Adapt the language and pacing to help someone move from ${emotionalState} toward a calmer state
${intentGuidance ? `- ${intentGuidance}\n` : ''}- Include natural pauses and moments of silence in your instructions
- Structure: Opening (2 min), Main practice (${durationMinutes - 4} min), Closing (2 min)
- Make it feel supportive, non-judgmental, and accessible

Return only the meditation script content, without any additional formatting or explanation.`;

    // Use Llama 3.1-8B via Inference Providers (updated: 2025-12-31)
    const modelId = 'meta-llama/Llama-3.1-8B-Instruct';
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const hfResponse = await fetch(
        'https://router.huggingface.co/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${hfApiKey}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: modelId,
            messages: [
              {
                role: 'system',
                content: 'You are an expert meditation teacher who creates personalized, accessible, and supportive guided meditation scripts. Your scripts are warm, clear, and help people find calm and presence.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            max_tokens: Math.floor(totalWords * 1.5),
            temperature: 0.7,
            top_p: 0.9
          }),
        }
      );

      clearTimeout(timeout);

      if (!hfResponse.ok) {
        const errorText = await hfResponse.text();
        console.error('HF Inference Providers error:', hfResponse.status, errorText);
        
        // Try OpenAI fallback if HF fails
        const openaiKey = process.env.OPENAI_API_KEY;
        if (openaiKey && hfResponse.status === 401) {
          console.log('[generate-practice] Falling back to OpenAI...');
          return generateWithOpenAI(req, res, prompt, emotionalState, durationMinutes, intent, wordsPerMinute, totalWords);
        }
        
        throw new Error(`HF Inference Providers error: ${hfResponse.status} - ${errorText.substring(0, 200)}`);
      }

      const hfData = await hfResponse.json();
      
      // Extract content from OpenAI-compatible response format
      let generatedContent = '';
      if (hfData.choices && hfData.choices[0]?.message?.content) {
        generatedContent = hfData.choices[0].message.content;
      } else {
        console.error('Unexpected Inference Providers response format:', hfData);
        throw new Error('Unexpected response format from Inference Providers');
      }

      // Clean up any remaining formatting
      generatedContent = generatedContent.trim();

      if (!generatedContent) {
        return res.status(500).json({ error: 'Failed to generate content' });
      }

      return res.status(200).json({
        content: generatedContent,
        emotionalState,
        durationMinutes,
        wordsPerMinute,
        estimatedWords: totalWords,
        provider: 'huggingface',
        model: modelId
      });
    } catch (error) {
      clearTimeout(timeout);
      
      if (error.name === 'AbortError') {
        console.error('HF request timeout after 30 seconds');
        return res.status(504).json({
          error: 'Generation timeout',
          message: 'The model took too long to respond. Please try again.'
        });
      }
      
      console.error('Error generating practice content:', error);
      return res.status(500).json({
        error: 'Failed to generate practice content',
        message: error.message,
        provider: 'huggingface'
      });
    }
  } catch (outerError) {
    console.error('Fatal error in generate-practice handler:', outerError);
    return res.status(500).json({
      error: 'Server error',
      message: outerError.message || 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}

// OpenAI fallback for when HF is unavailable
async function generateWithOpenAI(req, res, prompt, emotionalState, durationMinutes, intent, wordsPerMinute, totalWords) {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return res.status(500).json({
      error: 'Failed to generate practice content',
      message: 'Both HF and OpenAI API keys are unavailable',
      provider: 'none'
    });
  }

  try {
    const openaiResponse = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert meditation teacher who creates personalized, accessible, and supportive guided meditation scripts. Your scripts are warm, clear, and help people find calm and presence.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: Math.floor(totalWords * 1.5),
          temperature: 0.7,
          top_p: 0.9
        }),
      }
    );

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI error:', openaiResponse.status, errorText);
      throw new Error(`OpenAI error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    
    let generatedContent = '';
    if (openaiData.choices && openaiData.choices[0]?.message?.content) {
      generatedContent = openaiData.choices[0].message.content;
    } else {
      throw new Error('Unexpected OpenAI response format');
    }

    generatedContent = generatedContent.trim();

    if (!generatedContent) {
      return res.status(500).json({ error: 'Failed to generate content' });
    }

    return res.status(200).json({
      content: generatedContent,
      emotionalState,
      durationMinutes,
      wordsPerMinute,
      estimatedWords: totalWords,
      provider: 'openai_fallback',
      model: 'gpt-4o-mini'
    });
  } catch (error) {
    console.error('OpenAI fallback error:', error);
    return res.status(500).json({
      error: 'Failed to generate practice content',
      message: error.message,
      provider: 'openai_fallback'
    });
  }
}
