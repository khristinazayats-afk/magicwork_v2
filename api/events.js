// @ts-nocheck
// POST /api/events - Record a gamification event
import { sql } from './db/client.js';
import { LP_VALUES, DAILY_CAPS, MILESTONES } from './config/gamification.js';

export const config = { runtime: 'nodejs' };

// Get user ID from request
function getUserId(req) {
  const DEV_MODE = process.env.NODE_ENV === 'development';
  const MOCK_USER_ID = 'dev-user-123';
  if (DEV_MODE) {
    return MOCK_USER_ID;
  }
  return req.body?.user_id || req.query?.user_id || MOCK_USER_ID;
}

// Get today's UTC date
function getTodayUTC() {
  return new Date().toISOString().split('T')[0];
}

// Calculate LP for an event
function calculateLP(eventType, metadata) {
  if (eventType === 'tune_play') {
    const minutes = Math.floor((metadata?.duration_sec || 0) / 60);
    return minutes * LP_VALUES.tune_play;
  }
  return LP_VALUES[eventType] || 0;
}

// Check if user has hit daily cap
async function checkDailyCap(userId, eventType, metadata, today) {
  const caps = DAILY_CAPS[eventType];
  if (!caps) return { allowed: true };

  if (eventType === 'practice_complete') {
    const space = metadata?.space;
    if (!space) return { allowed: false, reason: 'Missing space in metadata' };

    const result = await sql`
      SELECT practice_spaces FROM daily_counters
      WHERE user_id = ${userId} AND date = ${today}
    `;
    
    if (result.rows.length > 0 && result.rows[0].practice_spaces) {
      const spaces = result.rows[0].practice_spaces;
      if (spaces.includes(space)) {
        return { allowed: false, reason: 'Already completed practice in this space today' };
      }
    }
    return { allowed: true };
  }

  if (eventType === 'share_post') {
    const result = await sql`
      SELECT share_post_count FROM daily_counters
      WHERE user_id = ${userId} AND date = ${today}
    `;
    
    if (result.rows.length > 0 && result.rows[0].share_post_count >= caps) {
      return { allowed: false, reason: 'Already posted a share today' };
    }
    return { allowed: true };
  }

  if (eventType === 'light_send') {
    const result = await sql`
      SELECT light_send_count FROM daily_counters
      WHERE user_id = ${userId} AND date = ${today}
    `;
    
    if (result.rows.length > 0 && result.rows[0].light_send_count >= caps) {
      return { allowed: false, reason: 'Daily limit of 3 light sends reached' };
    }
    return { allowed: true };
  }

  return { allowed: true };
}

// Update daily counter
async function updateDailyCounter(userId, eventType, lpEarned, metadata, today) {
  const result = await sql`
    INSERT INTO daily_counters (user_id, date, present, lp_earned, practice_spaces, share_post_count, light_send_count, tune_minutes)
    VALUES (${userId}, ${today}, true, ${lpEarned}, 
            ${eventType === 'practice_complete' ? [metadata?.space] : []}::TEXT[],
            ${eventType === 'share_post' ? 1 : 0},
            ${eventType === 'light_send' ? 1 : 0},
            ${eventType === 'tune_play' ? Math.floor((metadata?.duration_sec || 0) / 60) : 0})
    ON CONFLICT (user_id, date) DO UPDATE SET
      present = true,
      lp_earned = daily_counters.lp_earned + ${lpEarned},
      practice_spaces = CASE 
        WHEN ${eventType === 'practice_complete'} AND NOT (${metadata?.space} = ANY(daily_counters.practice_spaces))
        THEN array_append(daily_counters.practice_spaces, ${metadata?.space})
        ELSE daily_counters.practice_spaces
      END,
      share_post_count = CASE 
        WHEN ${eventType === 'share_post'} THEN daily_counters.share_post_count + 1
        ELSE daily_counters.share_post_count
      END,
      light_send_count = CASE 
        WHEN ${eventType === 'light_send'} THEN daily_counters.light_send_count + 1
        ELSE daily_counters.light_send_count
      END,
      tune_minutes = CASE 
        WHEN ${eventType === 'tune_play'} THEN daily_counters.tune_minutes + ${Math.floor((metadata?.duration_sec || 0) / 60)}
        ELSE daily_counters.tune_minutes
      END,
      updated_at = NOW()
    RETURNING *
  `;
  return result.rows[0];
}

// Calculate presence streak
async function calculateStreak(userId) {
  const result = await sql`
    SELECT date, present FROM daily_counters
    WHERE user_id = ${userId} AND present = true
    ORDER BY date DESC
    LIMIT 30
  `;

  if (result.rows.length === 0) return 0;

  const today = getTodayUTC();
  let streak = 0;
  let currentDate = new Date(today);

  for (const row of result.rows) {
    const rowDate = new Date(row.date).toISOString().split('T')[0];
    const expectedDate = currentDate.toISOString().split('T')[0];

    if (rowDate === expectedDate) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// Calculate lifetime active days
async function calculateLifetimeDays(userId) {
  const result = await sql`
    SELECT COUNT(DISTINCT date) as count FROM daily_counters
    WHERE user_id = ${userId} AND present = true
  `;
  return parseInt(result.rows[0]?.count || 0);
}

// Check and grant milestones
async function checkMilestones(userId, lifetimeDays, consecutiveDays) {
  const grantedResult = await sql`
    SELECT milestone_id FROM milestones_granted
    WHERE user_id = ${userId}
  `;
  const grantedIds = new Set(grantedResult.rows.map(r => r.milestone_id));

  const { MILESTONES } = await import('./config/gamification.js');
  const eligible = MILESTONES.filter(m => 
    !grantedIds.has(m.id) &&
    lifetimeDays >= m.lifetime_days &&
    consecutiveDays >= m.consecutive_days
  );

  if (eligible.length === 0) return null;

  // Grant the highest eligible milestone
  const milestone = eligible[eligible.length - 1];
  
  await sql`
    INSERT INTO milestones_granted (user_id, milestone_id)
    VALUES (${userId}, ${milestone.id})
    ON CONFLICT (user_id, milestone_id) DO NOTHING
  `;

  return milestone;
}

export default async function handler(req, res) {
  // CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if database is configured
  if (!process.env.POSTGRES_URL) {
    console.warn('POSTGRES_URL not configured, returning mock response');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({
      success: true,
      lp_earned: LP_VALUES[req.body?.event_type] || 0,
      today_lp: 0,
      streak: 0,
      lifetime_days: 0,
      milestone_granted: null,
    });
  }

  try {
    const userId = getUserId(req);
    const { event_type, metadata = {}, occurred_at } = req.body || {};

    if (!event_type) {
      return res.status(400).json({ error: 'event_type is required' });
    }

    if (!['tune_play', 'practice_complete', 'share_post', 'light_send'].includes(event_type)) {
      return res.status(400).json({ error: 'Invalid event_type' });
    }

    const today = getTodayUTC();

    // Check daily cap
    const capCheck = await checkDailyCap(userId, event_type, metadata, today);
    if (!capCheck.allowed) {
      return res.status(200).json({
        success: false,
        message: capCheck.reason || 'Daily limit reached',
        lp_earned: 0,
        milestone_granted: null,
      });
    }

    // Calculate LP
    const lpEarned = calculateLP(event_type, metadata);

    // Record event
    const occurredAt = occurred_at ? new Date(occurred_at) : new Date();
    await sql`
      INSERT INTO events (user_id, event_type, metadata, occurred_at, lp_earned)
      VALUES (${userId}, ${event_type}, ${JSON.stringify(metadata)}::JSONB, ${occurredAt}, ${lpEarned})
    `;

    // Update daily counter
    await updateDailyCounter(userId, event_type, lpEarned, metadata, today);

    // Calculate streak and lifetime days
    const streak = await calculateStreak(userId);
    const lifetimeDays = await calculateLifetimeDays(userId);

    // Check milestones
    const milestone = await checkMilestones(userId, lifetimeDays, streak);

    // Get today's total LP
    const todayResult = await sql`
      SELECT lp_earned FROM daily_counters
      WHERE user_id = ${userId} AND date = ${today}
    `;
    const todayLP = todayResult.rows[0]?.lp_earned || 0;

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({
      success: true,
      lp_earned: lpEarned,
      today_lp: todayLP,
      streak,
      lifetime_days: lifetimeDays,
      milestone_granted: milestone,
    });
  } catch (error) {
    console.error('Events API error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
}

