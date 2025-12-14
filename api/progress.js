// @ts-nocheck
// GET /api/progress - Get user progress data
import { sql } from './db/client.js';
import { DAILY_LP_TARGET } from './config/gamification.js';

export const config = { runtime: 'nodejs' };

// Get user ID from request
function getUserId(req) {
  const DEV_MODE = process.env.NODE_ENV === 'development';
  const MOCK_USER_ID = 'dev-user-123';
  if (DEV_MODE) {
    return MOCK_USER_ID;
  }
  return req.query?.user_id || req.body?.user_id || MOCK_USER_ID;
}

// Get today's UTC date
function getTodayUTC() {
  return new Date().toISOString().split('T')[0];
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

// Get 30-day LP sparkline
async function getSparkline(userId) {
  const result = await sql`
    SELECT date, lp_earned FROM daily_counters
    WHERE user_id = ${userId}
    ORDER BY date DESC
    LIMIT 30
  `;

  // Create array for last 30 days, filling in zeros for missing days
  const sparkline = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const row = result.rows.find(r => r.date.toISOString().split('T')[0] === dateStr);
    sparkline.push(row?.lp_earned || 0);
  }

  return sparkline;
}

export default async function handler(req, res) {
  // CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if database is configured
  if (!process.env.POSTGRES_URL) {
    console.warn('POSTGRES_URL not configured, returning mock response');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({
      today_lp: 0,
      present_today: false,
      streak: 0,
      lifetime_days: 0,
      milestones: [],
      sparkline: Array(30).fill(0),
      daily_target: DAILY_LP_TARGET,
    });
  }

  try {
    const userId = getUserId(req);
    const today = getTodayUTC();

    // Get today's LP
    const todayResult = await sql`
      SELECT lp_earned, present FROM daily_counters
      WHERE user_id = ${userId} AND date = ${today}
    `;
    const todayLP = todayResult.rows[0]?.lp_earned || 0;
    const presentToday = todayResult.rows[0]?.present || false;

    // Calculate streak
    const streak = await calculateStreak(userId);

    // Calculate lifetime active days
    const lifetimeResult = await sql`
      SELECT COUNT(DISTINCT date) as count FROM daily_counters
      WHERE user_id = ${userId} AND present = true
    `;
    const lifetimeDays = parseInt(lifetimeResult.rows[0]?.count || 0);

    // Get granted milestones
    const milestonesResult = await sql`
      SELECT mg.milestone_id, mg.granted_at
      FROM milestones_granted mg
      WHERE mg.user_id = ${userId}
      ORDER BY mg.milestone_id ASC
    `;
    const grantedMilestones = milestonesResult.rows.map(r => ({
      id: r.milestone_id,
      granted_at: r.granted_at,
    }));

    // Get 30-day sparkline
    const sparkline = await getSparkline(userId);

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({
      today_lp: todayLP,
      present_today: presentToday,
      streak,
      lifetime_days: lifetimeDays,
      milestones: grantedMilestones,
      sparkline,
      daily_target: DAILY_LP_TARGET,
    });
  } catch (error) {
    console.error('Progress API error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
}

