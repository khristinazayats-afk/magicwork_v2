/**
 * Usage Tracking API
 * 
 * Tracks practice sessions and provides live user counts
 * 
 * Endpoints:
 * - POST /api/usage-tracking/start - Start a practice session
 * - POST /api/usage-tracking/heartbeat - Update session heartbeat
 * - POST /api/usage-tracking/complete - Complete a practice session
 * - GET /api/usage-tracking/live-count?space=SpaceName&card=0 - Get live user count for a card
 * - GET /api/usage-tracking/live-counts?space=SpaceName - Get live counts for all cards in a space
 */

import { sql } from '@vercel/postgres';

/**
 * Start a practice session
 */
export async function startSession(sessionData) {
  try {
    const {
      session_id,
      user_id = null,
      space_name,
      card_index,
      card_id = null,
      video_asset_id = null,
      audio_asset_id = null,
      video_url = null,
      audio_url = null,
      selected_duration_minutes = null,
      voice_audio_selected = null
    } = sessionData;

    // Create active session
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    
    await sql`
      INSERT INTO active_sessions (
        session_id,
        user_id,
        space_name,
        card_index,
        card_id,
        video_asset_id,
        audio_asset_id,
        started_at,
        last_heartbeat,
        expires_at
      )
      VALUES (
        ${session_id},
        ${user_id},
        ${space_name},
        ${card_index},
        ${card_id},
        ${video_asset_id},
        ${audio_asset_id},
        NOW(),
        NOW(),
        ${expiresAt.toISOString()}
      )
      ON CONFLICT (session_id) 
      DO UPDATE SET
        last_heartbeat = NOW(),
        expires_at = ${expiresAt.toISOString()},
        space_name = ${space_name},
        card_index = ${card_index}
    `;

    return { success: true, session_id };
  } catch (error) {
    console.error('Error starting session:', error);
    throw error;
  }
}

/**
 * Update session heartbeat (keep session alive)
 */
export async function updateHeartbeat(sessionId) {
  try {
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    
    const result = await sql`
      UPDATE active_sessions
      SET 
        last_heartbeat = NOW(),
        expires_at = ${expiresAt.toISOString()}
      WHERE session_id = ${sessionId}
        AND expires_at > NOW()
      RETURNING id
    `;

    return { success: result.rows.length > 0 };
  } catch (error) {
    console.error('Error updating heartbeat:', error);
    throw error;
  }
}

/**
 * Complete a practice session
 */
export async function completeSession(sessionData) {
  try {
    const {
      session_id,
      user_id = null,
      space_name,
      card_index,
      card_id = null,
      video_asset_id = null,
      audio_asset_id = null,
      video_url = null,
      audio_url = null,
      duration_seconds,
      selected_duration_minutes = null,
      voice_audio_selected = null,
      completion_message_shown = null
    } = sessionData;

    // Create completed session record
    await sql`
      INSERT INTO practice_sessions (
        user_id,
        session_id,
        space_name,
        card_index,
        card_id,
        video_asset_id,
        audio_asset_id,
        video_url,
        audio_url,
        duration_seconds,
        selected_duration_minutes,
        voice_audio_selected,
        completed,
        completion_message_shown,
        started_at,
        completed_at
      )
      VALUES (
        ${user_id},
        ${session_id},
        ${space_name},
        ${card_index},
        ${card_id},
        ${video_asset_id},
        ${audio_asset_id},
        ${video_url},
        ${audio_url},
        ${duration_seconds},
        ${selected_duration_minutes},
        ${voice_audio_selected},
        TRUE,
        ${completion_message_shown},
        NOW() - INTERVAL '${duration_seconds} seconds',
        NOW()
      )
    `;

    // Remove from active sessions
    await sql`
      DELETE FROM active_sessions
      WHERE session_id = ${session_id}
    `;

    return { success: true };
  } catch (error) {
    console.error('Error completing session:', error);
    throw error;
  }
}

/**
 * Get live user count for a specific card
 */
export async function getLiveUserCount(spaceName, cardIndex) {
  try {
    // Clean up expired sessions first
    await sql`DELETE FROM active_sessions WHERE expires_at < NOW()`;
    
    const result = await sql`
      SELECT COUNT(*)::INTEGER as count
      FROM active_sessions
      WHERE space_name = ${spaceName}
        AND card_index = ${cardIndex}
        AND expires_at > NOW()
    `;

    return result.rows[0]?.count || 0;
  } catch (error) {
    console.error('Error getting live user count:', error);
    return 0; // Return 0 on error to not break UI
  }
}

/**
 * Get live user counts for all cards in a space
 */
export async function getLiveUserCounts(spaceName) {
  try {
    // Clean up expired sessions first
    await sql`DELETE FROM active_sessions WHERE expires_at < NOW()`;
    
    const result = await sql`
      SELECT 
        card_index,
        COUNT(*)::INTEGER as user_count
      FROM active_sessions
      WHERE space_name = ${spaceName}
        AND expires_at > NOW()
      GROUP BY card_index
      ORDER BY card_index
    `;

    // Convert to object with card_index as key
    const counts = {};
    result.rows.forEach(row => {
      counts[row.card_index] = row.user_count;
    });

    // Ensure all 4 cards have a count (default to 0)
    for (let i = 0; i < 4; i++) {
      if (counts[i] === undefined) {
        counts[i] = 0;
      }
    }

    return counts;
  } catch (error) {
    console.error('Error getting live user counts:', error);
    // Return default counts on error
    return { 0: 0, 1: 0, 2: 0, 3: 0 };
  }
}

/**
 * API Handler for Vercel
 */
export default async function handler(req, res) {
  const { method, query, body } = req;
  const { space, card, action } = query;
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    if (method === 'POST') {
      if (action === 'start') {
        const result = await startSession(body);
        return res.status(200).json(result);
      }
      
      if (action === 'heartbeat') {
        const result = await updateHeartbeat(body.session_id);
        return res.status(200).json(result);
      }
      
      if (action === 'complete') {
        const result = await completeSession(body);
        return res.status(200).json(result);
      }
      
      return res.status(400).json({ error: 'Invalid action' });
    }
    
    if (method === 'GET') {
      if (action === 'live-count') {
        if (!space || card === undefined) {
          return res.status(400).json({ error: 'Missing space or card parameter' });
        }
        const count = await getLiveUserCount(space, parseInt(card));
        return res.status(200).json({ count });
      }
      
      if (action === 'live-counts') {
        if (!space) {
          return res.status(400).json({ error: 'Missing space parameter' });
        }
        const counts = await getLiveUserCounts(space);
        return res.status(200).json(counts);
      }
      
      return res.status(400).json({ error: 'Invalid action' });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

