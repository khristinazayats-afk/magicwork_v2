#!/usr/bin/env node

/**
 * Add clouds.mp4 video to Slow Morning space as the first video
 * 
 * Usage:
 *   node scripts/add-clouds-to-slow-morning.js
 */

import pkg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pkg;

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root
const envPath = join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL,
  ssl: process.env.POSTGRES_URL?.includes('sslmode=require') ? {
    rejectUnauthorized: false
  } : {
    rejectUnauthorized: false  // Allow self-signed certificates
  }
});

// Configuration
const S3_BUCKET = process.env.S3_BUCKET || 'magiwork-canva-assets';
const AWS_REGION = process.env.AWS_REGION || 'eu-north-1';
const CDN_BASE_URL = process.env.CDN_BASE_URL || `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com`;

// Video asset to add
const VIDEO_ASSET = {
  id: 'slow-morning-clouds-video',
  name: 'Slow Morning - Clouds Video',
  s3Key: 'videos/canva/clouds.mp4',
  type: 'video',
  format: 'mp4',
  allocatedSpace: 'Slow Morning',
  cdnUrl: `${CDN_BASE_URL}/videos/canva/clouds.mp4`,
  notes: 'Clouds background video for Slow Morning practice - first video'
};

async function addVideoToSlowMorning() {
  const client = await pool.connect();
  
  try {
    console.log('🎬 Adding clouds.mp4 video to Slow Morning space...\n');
    console.log('Video details:');
    console.log(`  ID: ${VIDEO_ASSET.id}`);
    console.log(`  Name: ${VIDEO_ASSET.name}`);
    console.log(`  S3 Key: ${VIDEO_ASSET.s3Key}`);
    console.log(`  CDN URL: ${VIDEO_ASSET.cdnUrl}`);
    console.log(`  Space: ${VIDEO_ASSET.allocatedSpace}\n`);

    // Check if video already exists
    const checkResult = await client.query(
      'SELECT id, name, allocated_space, status FROM content_assets WHERE id = $1',
      [VIDEO_ASSET.id]
    );

    if (checkResult.rows.length > 0) {
      const existing = checkResult.rows[0];
      console.log(`⚠️  Video with ID "${VIDEO_ASSET.id}" already exists:`);
      console.log(`   Name: ${existing.name}`);
      console.log(`   Space: ${existing.allocated_space}`);
      console.log(`   Status: ${existing.status}\n`);

      // Update it to Slow Morning and make it first
      console.log('🔄 Updating existing video to Slow Morning space...');
      await client.query(`
        UPDATE content_assets 
        SET 
          name = $1,
          allocated_space = $2,
          s3_key = $3,
          cdn_url = $4,
          type = $5,
          format = $6,
          status = 'live',
          notes = $7,
          created_at = NOW() - INTERVAL '1 day',
          updated_at = NOW()
        WHERE id = $8
      `, [
        VIDEO_ASSET.name,
        VIDEO_ASSET.allocatedSpace,
        VIDEO_ASSET.s3Key,
        VIDEO_ASSET.cdnUrl,
        VIDEO_ASSET.type,
        VIDEO_ASSET.format,
        VIDEO_ASSET.notes,
        VIDEO_ASSET.id
      ]);
      console.log('✅ Video updated successfully!\n');
    } else {
      // Insert new video with earlier created_at to ensure it's first
      console.log('➕ Inserting new video...');
      await client.query(`
        INSERT INTO content_assets (
          id,
          name,
          s3_key,
          cdn_url,
          type,
          format,
          allocated_space,
          status,
          notes,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW() - INTERVAL '1 day', NOW())
      `, [
        VIDEO_ASSET.id,
        VIDEO_ASSET.name,
        VIDEO_ASSET.s3Key,
        VIDEO_ASSET.cdnUrl,
        VIDEO_ASSET.type,
        VIDEO_ASSET.format,
        VIDEO_ASSET.allocatedSpace,
        'live',
        VIDEO_ASSET.notes
      ]);
      console.log('✅ Video added successfully!\n');
    }

    // Verify the video is now in Slow Morning and is first
    console.log('🔍 Verifying video in Slow Morning space...');
    const verifyResult = await client.query(`
      SELECT id, name, type, allocated_space, status, created_at
      FROM content_assets 
      WHERE allocated_space = $1 AND status = 'live'
      ORDER BY created_at ASC, id ASC
    `, [VIDEO_ASSET.allocatedSpace]);

    console.log(`\n📋 Found ${verifyResult.rows.length} live asset(s) in "Slow Morning":\n`);
    verifyResult.rows.forEach((asset, index) => {
      const isFirst = index === 0;
      const marker = isFirst ? '👉' : '  ';
      console.log(`${marker} ${index + 1}. ${asset.name} (${asset.type})`);
      console.log(`     ID: ${asset.id}`);
      console.log(`     Created: ${asset.created_at}`);
      if (isFirst && asset.id === VIDEO_ASSET.id) {
        console.log(`     ✅ This is the first video!`);
      }
      console.log('');
    });

    if (verifyResult.rows.length > 0 && verifyResult.rows[0].id === VIDEO_ASSET.id) {
      console.log('✅ Success! Clouds video is now the first video in Slow Morning space.\n');
    } else if (verifyResult.rows.length > 0) {
      console.log('⚠️  Video added but may not be first. Check ordering.\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
addVideoToSlowMorning();
