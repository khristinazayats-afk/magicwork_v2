/**
 * Practice Cards API
 * 
 * Manages individual card data for each space
 * Each space has 4 cards (index 0-3) that can be edited independently
 * 
 * Endpoints:
 * - GET /api/practice-cards?space=SpaceName - Get all cards for a space
 * - GET /api/practice-cards?space=SpaceName&index=0 - Get specific card
 * - PUT /api/practice-cards - Update a card
 * - POST /api/practice-cards - Create a card
 */

import { sql } from '@vercel/postgres';

/**
 * Get all cards for a specific space
 */
export async function getCardsBySpace(spaceName) {
  try {
    const result = await sql`
      SELECT * FROM practice_cards
      WHERE space_name = ${spaceName}
        AND status = 'active'
      ORDER BY card_index ASC
    `;
    
    return result.rows;
  } catch (error) {
    console.error('Error fetching practice cards:', error);
    throw error;
  }
}

/**
 * Get a specific card by space and index
 */
export async function getCardBySpaceAndIndex(spaceName, cardIndex) {
  try {
    const result = await sql`
      SELECT * FROM practice_cards
      WHERE space_name = ${spaceName}
        AND card_index = ${cardIndex}
        AND status = 'active'
      LIMIT 1
    `;
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching practice card:', error);
    throw error;
  }
}

/**
 * Update a practice card
 */
export async function updateCard(cardData) {
  try {
    const {
      space_name,
      card_index,
      title,
      description,
      guidance,
      is_practice_of_day,
      practice_type,
      duration_minutes,
      video_asset_id,
      audio_asset_id,
      status
    } = cardData;
    
    const result = await sql`
      UPDATE practice_cards
      SET 
        title = COALESCE(${title}, title),
        description = COALESCE(${description}, description),
        guidance = COALESCE(${guidance}, guidance),
        is_practice_of_day = COALESCE(${is_practice_of_day}, is_practice_of_day),
        practice_type = COALESCE(${practice_type}, practice_type),
        duration_minutes = COALESCE(${duration_minutes}, duration_minutes),
        video_asset_id = COALESCE(${video_asset_id}, video_asset_id),
        audio_asset_id = COALESCE(${audio_asset_id}, audio_asset_id),
        status = COALESCE(${status}, status),
        updated_at = NOW()
      WHERE space_name = ${space_name}
        AND card_index = ${card_index}
      RETURNING *
    `;
    
    return result.rows[0];
  } catch (error) {
    console.error('Error updating practice card:', error);
    throw error;
  }
}

/**
 * Create a new practice card
 */
export async function createCard(cardData) {
  try {
    const {
      space_name,
      card_index,
      title,
      description,
      guidance,
      is_practice_of_day = false,
      practice_type = 'ambient',
      duration_minutes,
      video_asset_id,
      audio_asset_id,
      status = 'active'
    } = cardData;
    
    const result = await sql`
      INSERT INTO practice_cards (
        space_name,
        card_index,
        title,
        description,
        guidance,
        is_practice_of_day,
        practice_type,
        duration_minutes,
        video_asset_id,
        audio_asset_id,
        status
      )
      VALUES (
        ${space_name},
        ${card_index},
        ${title},
        ${description},
        ${guidance},
        ${is_practice_of_day},
        ${practice_type},
        ${duration_minutes},
        ${video_asset_id},
        ${audio_asset_id},
        ${status}
      )
      ON CONFLICT (space_name, card_index) 
      DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        guidance = EXCLUDED.guidance,
        is_practice_of_day = EXCLUDED.is_practice_of_day,
        practice_type = EXCLUDED.practice_type,
        duration_minutes = EXCLUDED.duration_minutes,
        video_asset_id = EXCLUDED.video_asset_id,
        audio_asset_id = EXCLUDED.audio_asset_id,
        status = EXCLUDED.status,
        updated_at = NOW()
      RETURNING *
    `;
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating practice card:', error);
    throw error;
  }
}

/**
 * API Handler for Vercel
 */
export default async function handler(req, res) {
  const { method, query, body } = req;
  const { space, index } = query;
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    if (method === 'GET') {
      // Get specific card by space and index
      if (space && index !== undefined) {
        const card = await getCardBySpaceAndIndex(space, parseInt(index));
        if (!card) {
          return res.status(404).json({ error: 'Card not found' });
        }
        return res.status(200).json(card);
      }
      
      // Get all cards for a space
      if (space) {
        const cards = await getCardsBySpace(space);
        return res.status(200).json(cards);
      }
      
      return res.status(400).json({ error: 'Missing space parameter' });
    }
    
    if (method === 'POST') {
      const card = await createCard(body);
      return res.status(201).json(card);
    }
    
    if (method === 'PUT') {
      const card = await updateCard(body);
      if (!card) {
        return res.status(404).json({ error: 'Card not found' });
      }
      return res.status(200).json(card);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}


