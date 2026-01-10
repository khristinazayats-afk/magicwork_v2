// @ts-nocheck
// GET /api/analytics-summary - Aggregate user analytics for recommendations
import { sql } from '../lib/db/client.js';

export const config = { runtime: 'nodejs' };

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

  // Fallback when DB not configured
  if (!process.env.POSTGRES_URL) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({
      streak: 0,
      last7PracticeCount: 0,
      topSpaces: [],
      avgPracticeDurationSec: null,
      timeOfDayPreference: 'afternoon',
    });
  }

  try {
    const userId = getUserId(req);

    // Streak from daily_counters (same logic as events API uses)
    const streakRows = await sql`
      SELECT date, present FROM daily_counters
      WHERE user_id = ${userId} AND present = true
      ORDER BY date DESC
      LIMIT 30
    `;
    let streak = 0;
    if (streakRows.rows.length) {
      let currentDate = new Date();
      for (const row of streakRows.rows) {
        const rowDate = new Date(row.date).toISOString().split('T')[0];
        const expectedDate = currentDate.toISOString().split('T')[0];
        if (rowDate === expectedDate) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Last 7 days practice completions
    const last7Rows = await sql`
      SELECT COUNT(*)::int AS count
      FROM events
      WHERE user_id = ${userId}
        AND event_type = 'practice_complete'
        AND occurred_at >= NOW() - INTERVAL '7 days'
    `;
    const last7PracticeCount = last7Rows.rows[0]?.count || 0;

    // Top spaces from last 30 days via daily_counters.practice_spaces
    const topSpaceRows = await sql`
      WITH last30 AS (
        SELECT practice_spaces, date
        FROM daily_counters
        WHERE user_id = ${userId} AND date >= (CURRENT_DATE - INTERVAL '30 days')
      ), unnested AS (
        SELECT UNNEST(practice_spaces) AS space, date FROM last30
      )
      SELECT space, COUNT(*)::int AS count, MAX(date) AS last_seen
      FROM unnested
      GROUP BY space
      ORDER BY count DESC
      LIMIT 5
    `;
    const topSpaces = topSpaceRows.rows.map(r => ({
      space: r.space,
      count: r.count,
      lastSeenDaysAgo: r.last_seen ? daysAgo(r.last_seen) : null,
    }));

    // Average practice duration from events metadata
    const durationRows = await sql`
      SELECT AVG((metadata->>'duration_sec')::int) AS avg_sec
      FROM events
      WHERE user_id = ${userId} AND event_type = 'practice_complete'
        AND (metadata->>'duration_sec') IS NOT NULL
    `;
    const avgPracticeDurationSec = durationRows.rows[0]?.avg_sec ? Number(durationRows.rows[0].avg_sec) : null;

    // Time-of-day preference from practice_complete events
    const todRows = await sql`
      SELECT DATE_PART('hour', occurred_at) AS hour, COUNT(*)::int AS count
      FROM events
      WHERE user_id = ${userId} AND event_type = 'practice_complete'
        AND occurred_at >= NOW() - INTERVAL '30 days'
      GROUP BY hour
      ORDER BY count DESC
      LIMIT 1
    `;
    let timeOfDayPreference = 'afternoon';
    if (todRows.rows.length) {
      const h = Number(todRows.rows[0].hour);
      if (h >= 5 && h < 12) timeOfDayPreference = 'morning';
      else if (h >= 12 && h < 17) timeOfDayPreference = 'afternoon';
      else if (h >= 17 && h < 21) timeOfDayPreference = 'evening';
      else timeOfDayPreference = 'night';
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({
      streak,
      last7PracticeCount,
      topSpaces,
      avgPracticeDurationSec,
      timeOfDayPreference,
    });
  } catch (error) {
    console.error('Analytics Summary API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
