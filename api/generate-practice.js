// @ts-nocheck
// POST /api/generate-practice - Generate meditation practice content using OpenAI
import OpenAI from 'openai';

export const config = { runtime: 'nodejs' };

// Initialize OpenAI client
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }
  return new OpenAI({ apiKey });
}

// Generate practice content based on emotional state and duration
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { emotionalState, durationMinutes } = req.body;

    // Validate inputs
    if (!emotionalState || typeof emotionalState !== 'string') {
      return res.status(400).json({ error: 'emotionalState is required and must be a string' });
    }

    if (!durationMinutes || typeof durationMinutes !== 'number' || durationMinutes < 1) {
      return res.status(400).json({ error: 'durationMinutes is required and must be a positive number' });
    }

    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY environment variable is not set');
      return res.status(500).json({ 
        error: 'OpenAI API key not configured',
        message: 'Please set OPENAI_API_KEY in Vercel environment variables'
      });
    }

    const openai = getOpenAIClient();

    // Determine pacing based on emotional state (from practice-generation.mdc)
    // Higher emotional states (more anxious) get slower, more guided pacing
    const emotionalScale = ['calm', 'neutral', 'slightly_anxious', 'anxious', 'very_anxious'];
    const emotionalIndex = emotionalScale.indexOf(emotionalState.toLowerCase());
    const isAnxious = emotionalIndex >= 2; // anxious or very anxious
    
    // Pacing: 120 words/min for guided (anxious), 30 words/min for minimal (calm)
    const wordsPerMinute = isAnxious ? 120 : 60;
    const totalWords = Math.floor(wordsPerMinute * durationMinutes);

    // Create prompt for meditation practice generation
    const prompt = `Create a ${durationMinutes}-minute guided meditation practice script for someone who is feeling ${emotionalState}.

Guidelines:
- Target approximately ${totalWords} words total (${wordsPerMinute} words per minute)
- Use ${isAnxious ? 'gentle, reassuring, and more detailed guidance' : 'minimal, space-giving language'}
- Focus on breathwork, body awareness, and present-moment attention
- Include specific instructions for physical sensations and breath awareness
- Adapt the language and pacing to help someone move from ${emotionalState} toward a calmer state
- Include natural pauses and moments of silence in your instructions
- Structure: Opening (2 min), Main practice (${durationMinutes - 4} min), Closing (2 min)
- Make it feel supportive, non-judgmental, and accessible

Return only the meditation script content, without any additional formatting or explanation.`;

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using mini for cost efficiency, can upgrade to gpt-4o if needed
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
      temperature: 0.7, // Balance between creativity and consistency
      max_tokens: Math.floor(totalWords * 1.5), // Allow some buffer
    });

    const generatedContent = completion.choices[0]?.message?.content;

    if (!generatedContent) {
      return res.status(500).json({ error: 'Failed to generate content' });
    }

    return res.status(200).json({
      content: generatedContent,
      emotionalState,
      durationMinutes,
      wordsPerMinute,
      estimatedWords: totalWords
    });

  } catch (error) {
    console.error('Error generating practice content:', error);
    
    // Handle OpenAI API errors
    if (error instanceof OpenAI.APIError) {
      return res.status(error.status || 500).json({
        error: 'OpenAI API error',
        message: error.message,
        type: error.type
      });
    }

    return res.status(500).json({
      error: 'Failed to generate practice content',
      message: error.message
    });
  }
}


