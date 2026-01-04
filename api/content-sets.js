/**
 * Content Sets API
 * 
 * Returns paired visual + audio content for spaces
 * 
 * Endpoints:
 * - GET /api/content-sets?space=SpaceName - Get content set for a space
 * - GET /api/content-sets/:id - Get specific content set by ID
 */

export const config = { runtime: 'nodejs' };

import { sql } from './db/client.js';

/**
 * Get content set for a specific space
 * Returns the most recent live content set (visual + audio pair)
 */
export async function getContentSetBySpace(space) {
  try {
    // Get visual asset for this space
    const visualResult = await sql`
      SELECT * FROM content_assets 
      WHERE allocated_space = ${space} 
        AND asset_role = 'visual' 
        AND status = 'live'
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    if (!visualResult.rows[0]) {
      return null; // No content set found for this space
    }
    
    const visual = visualResult.rows[0];
    
    // Get paired audio asset
    let audio = null;
    if (visual.paired_asset_id) {
      const audioResult = await sql`
        SELECT * FROM content_assets 
        WHERE id = ${visual.paired_asset_id}
          AND status = 'live'
        LIMIT 1
      `;
      audio = audioResult.rows[0] || null;
    }
    
    return {
      id: visual.content_set_id || visual.id,
      space: space,
      visual: visual,
      audio: audio
    };
  } catch (error) {
    console.error('Error fetching content set:', error);
    throw error;
  }
}

/**
 * Get content set by ID
 */
export async function getContentSetById(setId) {
  try {
    // Get visual asset
    const visualResult = await sql`
      SELECT * FROM content_assets 
      WHERE content_set_id = ${setId}
        AND asset_role = 'visual'
        AND status = 'live'
      LIMIT 1
    `;
    
    if (!visualResult.rows[0]) {
      return null;
    }
    
    const visual = visualResult.rows[0];
    
    // Get paired audio
    let audio = null;
    if (visual.paired_asset_id) {
      const audioResult = await sql`
        SELECT * FROM content_assets 
        WHERE id = ${visual.paired_asset_id}
          AND status = 'live'
        LIMIT 1
      `;
      audio = audioResult.rows[0] || null;
    }
    
    return {
      id: setId,
      space: visual.allocated_space,
      visual: visual,
      audio: audio
    };
  } catch (error) {
    console.error('Error fetching content set:', error);
    throw error;
  }
}

/**
 * Get all content sets (for admin/debugging)
 */
export async function getAllContentSets() {
  try {
    // Get all visual assets that are part of content sets
    const result = await sql`
      SELECT 
        content_set_id,
        allocated_space,
        visual.id as visual_id,
        visual.cdn_url as visual_url,
        visual.type as visual_type,
        visual.format as visual_format,
        audio.id as audio_id,
        audio.cdn_url as audio_url,
        audio.format as audio_format
      FROM content_assets visual
      LEFT JOIN content_assets audio ON visual.paired_asset_id = audio.id
      WHERE visual.asset_role = 'visual'
        AND visual.status = 'live'
        AND visual.content_set_id IS NOT NULL
      ORDER BY visual.created_at DESC
    `;
    
    return result.rows.map(row => ({
      id: row.content_set_id,
      space: row.allocated_space,
      visual: {
        id: row.visual_id,
        url: row.visual_url,
        type: row.visual_type,
        format: row.visual_format
      },
      audio: row.audio_id ? {
        id: row.audio_id,
        url: row.audio_url,
        format: row.audio_format
      } : null
    }));
  } catch (error) {
    console.error('Error fetching all content sets:', error);
    throw error;
  }
}

/**
 * API Handler for Vercel
 */
export default async function handler(req, res) {
  const { method, query } = req;
  const { space, id } = query;
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Get specific content set by ID
    if (id) {
      const contentSet = await getContentSetById(id);
      
      if (!contentSet) {
        return res.status(404).json({ error: 'Content set not found' });
      }
      
      return res.status(200).json(contentSet);
    }
    
    // Get content set by space
    if (space) {
      const contentSet = await getContentSetBySpace(space);
      
      if (!contentSet) {
        return res.status(404).json({ error: 'No content set found for this space' });
      }
      
      return res.status(200).json(contentSet);
    }
    
    // Get all content sets (for admin)
    const contentSets = await getAllContentSets();
    return res.status(200).json(contentSets);
    
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

