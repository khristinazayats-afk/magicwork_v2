// @ts-nocheck
// POST /api/generate-recommendations - AI-powered personalized practice recommendations
// Analyzes user's meditation history and generates intelligent suggestions

import { sql } from '../lib/db/client.js';

export const config = { runtime: 'nodejs', maxDuration: 30 };

function getUserId(req) {
  const DEV_MODE = process.env.NODE_ENV === 'development';
  const MOCK_USER_ID = 'dev-user-123';
  if (DEV_MODE) return MOCK_USER_ID;
  return req.query?.user_id || req.body?.user_id || MOCK_USER_ID;
}

function daysAgo(date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
  return Math.floor(diff);
}

// Analyze user patterns from analytics events
async function analyzeUserHistory(userId) {
  if (!process.env.POSTGRES_URL) {
    return {
      practices: [],
      ambientPreferences: {},
      timePatterns: {},
      emotionalJourneys: []
    };
  }

  try {
    // Get last 50 completed practices with metadata
    const practiceRows = await sql`
      SELECT 
        event_id,
        occurred_at,
        properties
      FROM events
      WHERE user_id = ${userId}
        AND event_type = 'practice_complete'
      ORDER BY occurred_at DESC
      LIMIT 50
    `;

    const practices = practiceRows.rows.map(row => ({
      timestamp: row.occurred_at,
      spaceName: row.properties?.spaceName || row.properties?.space,
      intent: row.properties?.intent,
      emotionalState: row.properties?.emotionalState || row.properties?.emotional_state,
      duration: row.properties?.durationSeconds || row.properties?.duration_sec,
      ambientSound: row.properties?.ambientSound,
    }));

    // Get ambient sound preferences
    const ambientRows = await sql`
      SELECT 
        properties->>'ambientSound' as sound_type,
        COUNT(*)::int as usage_count,
        MAX(occurred_at) as last_used
      FROM events
      WHERE user_id = ${userId}
        AND event_type = 'ambient_sound_played'
      GROUP BY properties->>'ambientSound'
      ORDER BY usage_count DESC
      LIMIT 10
    `;

    const ambientPreferences = {};
    ambientRows.rows.forEach(row => {
      if (row.sound_type) {
        ambientPreferences[row.sound_type] = {
          count: row.usage_count,
          lastUsed: row.last_used,
          daysAgo: daysAgo(row.last_used)
        };
      }
    });

    // Analyze time-of-day patterns
    const timePatterns = {};
    practices.forEach(p => {
      const hour = new Date(p.timestamp).getHours();
      let period;
      if (hour >= 5 && hour < 12) period = 'morning';
      else if (hour >= 12 && hour < 17) period = 'afternoon';
      else if (hour >= 17 && hour < 21) period = 'evening';
      else period = 'night';
      
      timePatterns[period] = (timePatterns[period] || 0) + 1;
    });

    // Track emotional state journeys (what works)
    const emotionalJourneys = practices
      .filter(p => p.emotionalState && p.intent)
      .map(p => ({
        from: p.emotionalState,
        to: p.intent,
        space: p.spaceName,
        duration: p.duration
      }));

    return {
      practices,
      ambientPreferences,
      timePatterns,
      emotionalJourneys
    };
  } catch (error) {
    console.error('Error analyzing user history:', error);
    return {
      practices: [],
      ambientPreferences: {},
      timePatterns: {},
      emotionalJourneys: []
    };
  }
}

// Generate AI recommendations using HF Inference Providers
async function generateRecommendations(history, currentContext) {
  const hfApiKey = process.env.HF_API_KEY;
  if (!hfApiKey) {
    return generateFallbackRecommendations(history, currentContext);
  }

  try {
    const prompt = buildRecommendationPrompt(history, currentContext);
    
    const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3.1-8B-Instruct',
        messages: [
          {
            role: 'system',
            content: 'You are a meditation coach analyzing user patterns to provide personalized practice recommendations. Respond with JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`HF API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    
    // Parse AI response
    try {
      const parsed = JSON.parse(content);
      return parsed.recommendations || generateFallbackRecommendations(history, currentContext);
    } catch {
      return generateFallbackRecommendations(history, currentContext);
    }
  } catch (error) {
    console.error('AI recommendation generation failed:', error);
    return generateFallbackRecommendations(history, currentContext);
  }
}

function buildRecommendationPrompt(history, context) {
  const { practices, ambientPreferences, timePatterns, emotionalJourneys } = history;
  const { timeOfDay, currentEmotionalState } = context;

  // Top 3 most practiced spaces
  const spaceCounts = {};
  practices.forEach(p => {
    if (p.spaceName) spaceCounts[p.spaceName] = (spaceCounts[p.spaceName] || 0) + 1;
  });
  const topSpaces = Object.entries(spaceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));

  // Favorite ambient sounds
  const topAmbient = Object.entries(ambientPreferences)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3)
    .map(([sound, data]) => ({ sound, count: data.count }));

  // Success patterns (emotional journeys that were repeated)
  const journeyPatterns = {};
  emotionalJourneys.forEach(j => {
    const key = `${j.from}→${j.to}`;
    journeyPatterns[key] = (journeyPatterns[key] || 0) + 1;
  });
  const topJourneys = Object.entries(journeyPatterns)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const prompt = `
Analyze this user's meditation history and provide 3 personalized quick practice recommendations.

USER HISTORY:
- Total practices: ${practices.length}
- Top spaces: ${topSpaces.map(s => `${s.name} (${s.count}x)`).join(', ') || 'None yet'}
- Favorite ambient sounds: ${topAmbient.map(a => `${a.sound} (${a.count}x)`).join(', ') || 'None yet'}
- Time preferences: ${Object.entries(timePatterns).map(([period, count]) => `${period}=${count}`).join(', ') || 'No pattern'}
- Successful patterns: ${topJourneys.map(([journey, count]) => `${journey} (${count}x)`).join(', ') || 'None yet'}

CURRENT CONTEXT:
- Time of day: ${timeOfDay}
- Current emotional state: ${currentEmotionalState || 'unknown'}

Generate 3 quick practice suggestions. Each should have:
1. title: Short catchy name (3-5 words)
2. duration: Duration in minutes (2, 5, or 10)
3. spaceName: One of the user's top spaces or a complementary one
4. intent: Recommended goal based on patterns
5. emotionalState: Starting emotional state
6. ambientSound: Recommended ambient sound from their favorites
7. reason: Brief explanation why this helps (10-15 words)

Respond with ONLY valid JSON:
{
  "recommendations": [
    {
      "title": "...",
      "duration": 5,
      "spaceName": "...",
      "intent": "reduce_stress",
      "emotionalState": "slightly_anxious",
      "ambientSound": "soft-rain",
      "reason": "..."
    }
  ]
}`;

  return prompt;
}

// Fallback recommendations when AI unavailable
function generateFallbackRecommendations(history, context) {
  const { practices, ambientPreferences, timePatterns } = history;
  const { timeOfDay } = context;

  // Find most used space
  const spaceCounts = {};
  practices.forEach(p => {
    if (p.spaceName) spaceCounts[p.spaceName] = (spaceCounts[p.spaceName] || 0) + 1;
  });
  const topSpace = Object.entries(spaceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Gentle De-Stress';

  // Find favorite ambient sound
  const topAmbient = Object.entries(ambientPreferences)
    .sort((a, b) => b[1].count - a[1].count)[0]?.[0] || 'soft-rain';

  // Time-based defaults
  const timeBasedDefaults = {
    morning: { intent: 'boost_energy', emotionalState: 'neutral', space: 'Slow Morning' },
    afternoon: { intent: 'improve_focus', emotionalState: 'neutral', space: 'Get in the Flow State' },
    evening: { intent: 'reduce_stress', emotionalState: 'slightly_anxious', space: 'Gentle De-Stress' },
    night: { intent: 'better_sleep', emotionalState: 'calm', space: 'Drift into Sleep' }
  };

  const defaults = timeBasedDefaults[timeOfDay] || timeBasedDefaults.evening;

  return [
    {
      title: 'Your Favorite Reset',
      duration: 5,
      spaceName: topSpace,
      intent: 'reduce_stress',
      emotionalState: 'slightly_anxious',
      ambientSound: topAmbient,
      reason: `Your most practiced space with your favorite ambient sound`
    },
    {
      title: `Perfect for ${timeOfDay}`,
      duration: 10,
      spaceName: defaults.space,
      intent: defaults.intent,
      emotionalState: defaults.emotionalState,
      ambientSound: topAmbient,
      reason: `Optimized for ${timeOfDay} based on your patterns`
    },
    {
      title: 'Quick Energy Boost',
      duration: 2,
      spaceName: topSpace,
      intent: 'boost_energy',
      emotionalState: 'neutral',
      ambientSound: 'breathing-space',
      reason: 'Fast refresh using your preferred space'
    }
  ];
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const userId = getUserId(req);
    const { timeOfDay, currentEmotionalState } = req.body;

    // Determine time of day if not provided
    const hour = new Date().getHours();
    let actualTimeOfDay = timeOfDay;
    if (!actualTimeOfDay) {
      if (hour >= 5 && hour < 12) actualTimeOfDay = 'morning';
      else if (hour >= 12 && hour < 17) actualTimeOfDay = 'afternoon';
      else if (hour >= 17 && hour < 21) actualTimeOfDay = 'evening';
      else actualTimeOfDay = 'night';
    }

    // Analyze user history
    const history = await analyzeUserHistory(userId);

    // Generate recommendations
    const recommendations = await generateRecommendations(history, {
      timeOfDay: actualTimeOfDay,
      currentEmotionalState
    });

    return res.status(200).json({
      recommendations,
      provider: 'ai',
      context: {
        totalPractices: history.practices.length,
        favoriteAmbient: Object.keys(history.ambientPreferences)[0] || null,
        timeOfDay: actualTimeOfDay
      }
    });
  } catch (error) {
    console.error('Recommendation generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate recommendations',
      recommendations: []
    });
  }
}
