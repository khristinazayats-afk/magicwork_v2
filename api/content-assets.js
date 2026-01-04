/**
 * Content Assets API
 * 
 * Serves content assets from PostgreSQL to the React app
 * 
 * Endpoints:
 * - GET /api/content-assets - Get all live assets
 * - GET /api/content-assets/:id - Get specific asset by ID
 * - GET /api/content-assets/space/:space - Get assets for a specific space
 */

export const config = { runtime: 'nodejs' };

import { sql } from './db/client.js';

// Check if database is configured
function checkDatabaseConfig() {
  if (!process.env.POSTGRES_URL) {
    console.error('⚠️ POSTGRES_URL environment variable is not set!');
    console.error('Database queries will fail. Please set POSTGRES_URL in Vercel environment variables.');
    return false;
  }
  return true;
}

/**
 * Get all live assets
 */
export async function getAllAssets() {
  try {
    const result = await sql`
      SELECT * FROM content_assets 
      WHERE status = 'live' 
      ORDER BY created_at DESC NULLS LAST, id ASC
    `;
    
    return result.rows;
  } catch (error) {
    console.error('Error fetching assets:', error);
    throw error;
  }
}

/**
 * Get asset by ID
 */
export async function getAssetById(id) {
  try {
    const result = await sql`
      SELECT * FROM content_assets 
      WHERE id = ${id} AND status = 'live'
      LIMIT 1
    `;
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching asset:', error);
    throw error;
  }
}

/**
 * Get mock videos array for "Drift into Sleep" - always available fallback
 */
function getDriftIntoSleepMockVideos() {
  const cdnBaseUrl = 'https://d3hajr7xji31qq.cloudfront.net';
  return [
    {
      id: 'drift-clouds-video',
      name: 'Clouds Video',
      cdn_url: `${cdnBaseUrl}/videos/canva/clouds.mp4`,
      type: 'video',
      format: 'mp4',
      s3_key: 'videos/canva/clouds.mp4',
      status: 'live',
      allocated_space: 'Drift into Sleep'
    },
    {
      id: 'drift-rain-video',
      name: 'Rain Video',
      cdn_url: `${cdnBaseUrl}/videos/canva/rain.mp4`,
      type: 'video',
      format: 'mp4',
      s3_key: 'videos/canva/rain.mp4',
      status: 'live',
      allocated_space: 'Drift into Sleep'
    },
    {
      id: 'drift-waves-video',
      name: 'Waves Video',
      cdn_url: `${cdnBaseUrl}/videos/canva/waves.mp4`,
      type: 'video',
      format: 'mp4',
      s3_key: 'videos/canva/waves.mp4',
      status: 'live',
      allocated_space: 'Drift into Sleep'
    },
    {
      id: 'drift-into-sleep-video-1',
      name: 'Drift into Sleep - Background Video 1',
      cdn_url: `${cdnBaseUrl}/videos/canva/breathe-to-relax-video.mp4`,
      type: 'video',
      format: 'mp4',
      s3_key: 'videos/canva/breathe-to-relax-video.mp4',
      status: 'live',
      allocated_space: 'Drift into Sleep'
    },
    {
      id: 'drift-into-sleep-audio',
      name: 'Drift into Sleep - Audio Track',
      cdn_url: `${cdnBaseUrl}/audio/download.wav`,
      type: 'audio',
      format: 'wav',
      s3_key: 'audio/download.wav',
      status: 'live',
      allocated_space: 'Drift into Sleep'
    }
  ];
}

/**
 * Get assets for a specific space
 * Returns real database content - only falls back to mock data if database is completely unavailable
 */
export async function getAssetsBySpace(space) {
  console.log('Fetching assets for space:', space);
  
  // Space should already be decoded by handler, but handle both cases
  const decodedSpace = typeof space === 'string' && space.includes('%') 
    ? decodeURIComponent(space) 
    : space;
  console.log('Decoded space:', decodedSpace);
  
  try {
    // Query database for assets
    const result = await sql`
      SELECT * FROM content_assets 
      WHERE allocated_space = ${decodedSpace} AND status = 'live'
      ORDER BY created_at ASC, id ASC
    `;
    
    console.log(`Found ${result.rows.length} assets for space "${decodedSpace}"`);
    
    // Return database results - even if empty or fewer than expected
    // The frontend should handle empty results gracefully
    if (result.rows.length > 0) {
      console.log(`Returning ${result.rows.length} assets from database for "${decodedSpace}"`);
      return result.rows;
    } else {
      console.warn(`No assets found in database for space "${decodedSpace}"`);
      return [];
    }
  } catch (dbError) {
    console.error('❌ Database error in getAssetsBySpace:', dbError);
    console.error('Error details:', {
      message: dbError.message,
      code: dbError.code,
      name: dbError.name,
      stack: dbError.stack,
      space: decodedSpace
    });
    
    // Check if POSTGRES_URL is configured
    if (!process.env.POSTGRES_URL) {
      console.error('❌ POSTGRES_URL environment variable is not set in Vercel!');
      console.error('This is why the database query is failing.');
      throw new Error('Database not configured: POSTGRES_URL environment variable is missing');
    }
    
    // Check for specific database errors
    if (dbError.code === 'ECONNREFUSED' || dbError.code === 'ENOTFOUND') {
      throw new Error(`Database connection failed: ${dbError.message}`);
    }
    
    if (dbError.message && dbError.message.includes('relation') && dbError.message.includes('does not exist')) {
      throw new Error(`Database table not found: ${dbError.message}`);
    }
    
    // Re-throw the error so it can be handled by the API handler
    // This will prevent silent fallback to mock data
    throw new Error(`Database query failed for space "${decodedSpace}": ${dbError.message}`);
  }
}

/**
 * Get mock data for "Drift into Sleep" - always available fallback
 */
function getDriftIntoSleepMockData() {
  const cdnBaseUrl = 'https://d3hajr7xji31qq.cloudfront.net';
  return {
    visual: {
      id: 'drift-clouds-video',
      name: 'Clouds Video',
      cdn_url: `${cdnBaseUrl}/videos/canva/clouds.mp4`,
      type: 'video',
      format: 'mp4',
      s3_key: 'videos/canva/clouds.mp4'
    },
    audio: {
      id: 'drift-into-sleep-audio',
      name: 'Drift into Sleep - Audio Track',
      cdn_url: `${cdnBaseUrl}/audio/download.wav`,
      type: 'audio',
      format: 'wav',
      s3_key: 'audio/download.wav'
    }
  };
}

/**
 * Get content set (visual + audio pair) for a specific space
 * Supports shared visuals (allocated_space IS NULL) that can be reused across spaces
 * Returns real database content - only falls back to mock data if database is completely unavailable
 */
export async function getContentSetBySpace(space) {
  // Space should already be decoded by handler, but handle both cases
  const decodedSpace = typeof space === 'string' && space.includes('%') 
    ? decodeURIComponent(space) 
    : space;
  console.log('Fetching content set for space:', decodedSpace);
  
  try {
    // Get space-specific audio (by type, since asset_role may not exist)
    const audioResult = await sql`
      SELECT * FROM content_assets 
      WHERE allocated_space = ${decodedSpace} 
        AND status = 'live'
        AND type = 'audio'
      LIMIT 1
    `;
    
    const audio = audioResult.rows[0] || null;
    console.log('Found audio:', audio ? audio.name : 'none');
    
    // Get visual: first try space-specific, then shared (allocated_space IS NULL)
    // Order by created_at ASC to get the first video (as requested for Slow Morning)
    const visualResult = await sql`
      SELECT * FROM content_assets 
      WHERE (
        (allocated_space = ${decodedSpace} AND (type = 'video' OR type = 'image'))
        OR (allocated_space IS NULL AND (type = 'video' OR type = 'image'))
      )
      AND status = 'live'
      ORDER BY allocated_space NULLS LAST, created_at ASC, id ASC
      LIMIT 1
    `;
    
    const visual = visualResult.rows[0] || null;
    console.log('Found visual:', visual ? visual.name : 'none');
    
    // Fallback: if no explicit visual/audio roles, try by type
    if (!visual || !audio) {
      const allAssetsResult = await sql`
        SELECT * FROM content_assets 
        WHERE allocated_space = ${decodedSpace} 
          AND status = 'live'
        ORDER BY type DESC
      `;
      
      if (allAssetsResult.rows.length > 0) {
        // Find visual (video or image) and audio by type
        const foundVisual = visual || allAssetsResult.rows.find(a => 
          a.type === 'video' || a.type === 'image'
        );
        const foundAudio = audio || allAssetsResult.rows.find(a => 
          a.type === 'audio'
        );
        
        return { visual: foundVisual || null, audio: foundAudio || null };
      }
    }
    
    // Return database results - even if incomplete
    console.log('Returning content set from database:', {
      hasVisual: !!visual,
      hasAudio: !!audio
    });
    
    return { visual, audio };
  } catch (dbError) {
    console.error('❌ Database error in getContentSetBySpace:', dbError);
    console.error('Error details:', {
      message: dbError.message,
      code: dbError.code,
      name: dbError.name,
      stack: dbError.stack,
      space: decodedSpace
    });
    
    // Check if POSTGRES_URL is configured
    if (!process.env.POSTGRES_URL) {
      console.error('❌ POSTGRES_URL environment variable is not set in Vercel!');
      console.error('This is why the database query is failing.');
      throw new Error('Database not configured: POSTGRES_URL environment variable is missing');
    }
    
    // Check for specific database errors
    if (dbError.code === 'ECONNREFUSED' || dbError.code === 'ENOTFOUND') {
      throw new Error(`Database connection failed: ${dbError.message}`);
    }
    
    if (dbError.message && dbError.message.includes('relation') && dbError.message.includes('does not exist')) {
      throw new Error(`Database table not found: ${dbError.message}`);
    }
    
    // Re-throw the error so it can be handled by the API handler
    // This will prevent silent fallback to mock data
    throw new Error(`Database query failed for space "${decodedSpace}": ${dbError.message}`);
  }
}

/**
 * API Handler for Vercel/Express
 */
export default async function handler(req, res) {
  // Set CORS headers first
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Check database configuration
  const dbConfigured = checkDatabaseConfig();
  if (!dbConfigured) {
    console.error('Database not configured - POSTGRES_URL missing');
  }
  
  const { method, query } = req;
  let { id, space, set } = query;
  
  // Decode URL-encoded parameters early
  let decodedSpace = space;
  if (space) {
    try {
      decodedSpace = decodeURIComponent(space);
    } catch (e) {
      console.warn('Failed to decode space parameter:', space);
      decodedSpace = space;
    }
  }
  
  const isDriftIntoSleep = decodedSpace === 'Drift into Sleep';
  
  try {
    console.log('API request:', { method, id, space: decodedSpace, set });
    
    // Get content set (visual + audio) for a space
    if (set === 'true' && decodedSpace) {
      try {
        const contentSet = await getContentSetBySpace(decodedSpace);
        console.log('✅ Content set result:', { 
          hasVisual: !!contentSet.visual, 
          hasAudio: !!contentSet.audio,
          visualCdnUrl: contentSet.visual?.cdn_url,
          audioCdnUrl: contentSet.audio?.cdn_url
        });
        // Verify we're returning database content (CDN URLs) not mock data (S3 URLs)
        if (contentSet.visual?.cdn_url?.includes('s3.eu-north-1.amazonaws.com') || 
            contentSet.audio?.cdn_url?.includes('s3.eu-north-1.amazonaws.com')) {
          console.warn('⚠️ WARNING: Returning S3 URLs instead of CDN URLs - this might be mock data!');
        }
        return res.status(200).json(contentSet);
      } catch (setError) {
        console.error('❌ Error fetching content set:', setError);
        // Return error with details for debugging
        return res.status(500).json({
          error: 'Failed to fetch content set from database',
          message: setError.message,
          details: {
            space: decodedSpace,
            postgresUrlConfigured: !!process.env.POSTGRES_URL,
            errorCode: setError.code,
            errorName: setError.name
          }
        });
      }
    }
    
    // Get specific asset by ID
    if (id) {
      try {
        const asset = await getAssetById(id);
        
        if (!asset) {
          return res.status(404).json({ error: 'Asset not found' });
        }
        
        return res.status(200).json(asset);
      } catch (idError) {
        console.error('❌ Error fetching asset by ID:', idError);
        return res.status(500).json({
          error: 'Failed to fetch asset from database',
          message: idError.message,
          details: {
            id,
            postgresUrlConfigured: !!process.env.POSTGRES_URL,
            errorCode: idError.code,
            errorName: idError.name
          }
        });
      }
    }
    
    // Get assets by space
    if (decodedSpace) {
      try {
        const assets = await getAssetsBySpace(decodedSpace);
        console.log(`✅ Returning ${assets.length} assets for space "${decodedSpace}"`);
        if (assets.length > 0) {
          console.log('Sample asset CDN URLs:', assets.slice(0, 2).map(a => a.cdn_url));
          // Verify we're returning database content (CDN URLs) not mock data (S3 URLs)
          const hasCdnUrls = assets.some(a => a.cdn_url?.includes('cloudfront.net'));
          const hasS3Urls = assets.some(a => a.cdn_url?.includes('s3.eu-north-1.amazonaws.com'));
          if (hasS3Urls && !hasCdnUrls) {
            console.warn('⚠️ WARNING: Returning S3 URLs instead of CDN URLs - this might be mock data!');
          }
        }
        return res.status(200).json(assets);
      } catch (assetsError) {
        console.error('❌ Error fetching assets:', assetsError);
        // Return error with details for debugging
        return res.status(500).json({
          error: 'Failed to fetch assets from database',
          message: assetsError.message,
          details: {
            space: decodedSpace,
            postgresUrlConfigured: !!process.env.POSTGRES_URL,
            errorCode: assetsError.code,
            errorName: assetsError.name
          }
        });
      }
    }
    
    // Get all assets
    try {
      const assets = await getAllAssets();
      return res.status(200).json(assets);
    } catch (allAssetsError) {
      console.error('❌ Error fetching all assets:', allAssetsError);
      return res.status(500).json({
        error: 'Failed to fetch assets from database',
        message: allAssetsError.message,
        details: {
          postgresUrlConfigured: !!process.env.POSTGRES_URL,
          errorCode: allAssetsError.code,
          errorName: allAssetsError.name
        }
      });
    }
    
  } catch (error) {
    console.error('API error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      query: { id, space, set },
      name: error.name,
      code: error.code
    });
    
    // Return detailed error for debugging - include full error info
    // Don't silently fallback to mock data - let the error propagate so we can debug
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || String(error),
      code: error.code,
      name: error.name,
      query: { id, space, set }
    });
  }
}

