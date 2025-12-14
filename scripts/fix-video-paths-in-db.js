#!/usr/bin/env node

/**
 * Fix video paths in database: video/canva/ -> videos/canva/
 * 
 * Usage:
 *   NODE_TLS_REJECT_UNAUTHORIZED=0 node scripts/fix-video-paths-in-db.js
 */

import pkg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL,
  ssl: process.env.POSTGRES_URL?.includes('sslmode=require') ? {
    rejectUnauthorized: false
  } : {
    rejectUnauthorized: false
  }
});

async function fixVideoPaths() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Fixing video paths in database...\n');
    console.log('   Changing: video/canva/ → videos/canva/\n');
    
    // Update s3_key and cdn_url for all video assets
    const result = await client.query(`
      UPDATE content_assets 
      SET 
        s3_key = REPLACE(s3_key, 'video/canva/', 'videos/canva/'),
        cdn_url = REPLACE(cdn_url, '/video/canva/', '/videos/canva/')
      WHERE s3_key LIKE 'video/canva/%' OR cdn_url LIKE '%/video/canva/%'
      RETURNING id, name, s3_key, cdn_url
    `);
    
    console.log(`✅ Updated ${result.rows.length} video asset(s):\n`);
    result.rows.forEach(asset => {
      console.log(`   - ${asset.name}`);
      console.log(`     S3 Key: ${asset.s3_key}`);
      console.log(`     CDN URL: ${asset.cdn_url}`);
      console.log('');
    });
    
    // Verify Slow Morning video
    const verify = await client.query(`
      SELECT id, name, s3_key, cdn_url, allocated_space 
      FROM content_assets 
      WHERE id = 'slow-morning-clouds-video' OR allocated_space = 'Slow Morning'
      ORDER BY created_at ASC
    `);
    
    if (verify.rows.length > 0) {
      console.log('📋 Slow Morning video(s):\n');
      verify.rows.forEach(video => {
        console.log(`   - ${video.name}`);
        console.log(`     S3 Key: ${video.s3_key}`);
        console.log(`     CDN URL: ${video.cdn_url}`);
        console.log(`     Space: ${video.allocated_space}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

fixVideoPaths();
