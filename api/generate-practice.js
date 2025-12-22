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
    const { emotionalState, durationMinutes, intent } = req.body;

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

    // Determine pacing based on emotional state
    const emotionalScale = ['calm', 'neutral', 'slightly_anxious', 'anxious', 'very_anxious'];
    const emotionalIndex = emotionalScale.indexOf(emotionalState.toLowerCase());
    const isAnxious = emotionalIndex >= 2; // anxious or very anxious
    
    // Pacing: 120 words/min for guided (anxious), 60 words/min for minimal (calm)
    const wordsPerMinute = isAnxious ? 120 : 60;
    const totalWords = Math.floor(wordsPerMinute * durationMinutes);

    // Build intent-specific guidance
    let intentGuidance = '';
    if (intent && typeof intent === 'string') {
      const intentLower = intent.toLowerCase();
      if (intentLower.includes('stress') || intentLower.includes('anxiety')) {
        intentGuidance = 'Focus on stress relief and anxiety reduction. Include techniques for releasing tension and finding calm.';
      } else if (intentLower.includes('focus') || intentLower.includes('concentration')) {
        intentGuidance = 'Focus on improving concentration and mental clarity. Include techniques for sustaining attention and reducing distractions.';
      } else if (intentLower.includes('sleep') || intentLower.includes('rest')) {
        intentGuidance = 'Focus on relaxation and sleep preparation. Use slower pacing, body relaxation, and imagery that promotes rest.';
      } else if (intentLower.includes('energy') || intentLower.includes('wake')) {
        intentGuidance = 'Focus on energizing and awakening. Include techniques that promote alertness and vitality while maintaining mindfulness.';
      } else if (intentLower.includes('emotion') || intentLower.includes('feeling')) {
        intentGuidance = 'Focus on emotional regulation and awareness. Include techniques for observing and working with emotions compassionately.';
      } else if (intentLower.includes('pain') || intentLower.includes('discomfort')) {
        intentGuidance = 'Focus on working with physical sensations and discomfort. Include body scanning and gentle awareness techniques.';
      } else if (intentLower.includes('gratitude') || intentLower.includes('appreciation')) {
        intentGuidance = 'Focus on cultivating gratitude and appreciation. Include reflection on positive aspects and feelings of thankfulness.';
      } else if (intentLower.includes('self-compassion') || intentLower.includes('kindness')) {
        intentGuidance = 'Focus on self-compassion and self-kindness. Include loving-kindness practices and gentle self-acceptance.';
      } else {
        intentGuidance = `Adapt the practice to support the user's intent: ${intent}.`;
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

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-5.2', // Using latest GPT-5.2 model
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
      temperature: 0.7,
      max_tokens: Math.floor(totalWords * 1.5),
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


