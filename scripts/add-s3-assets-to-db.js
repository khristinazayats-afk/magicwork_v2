#!/usr/bin/env node

/**
 * Add manually uploaded S3 files to the content_assets database
 * 
 * Usage:
 *   node scripts/add-s3-assets-to-db.js
 * 
 * This script reads S3 file information and adds them to the database
 * so they can be used in the MagicWork app.
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
  } : false
});

// Configuration - update these based on your S3 setup
const S3_BUCKET = process.env.S3_BUCKET || 'magicwork-canva-assets';
const CDN_BASE_URL = process.env.CDN_BASE_URL || process.env.CDN_BASE || process.env.CDN_DOMAIN || 'https://cdn.magicwork.app';
const AWS_REGION = process.env.AWS_REGION || 'eu-north-1';

/**
 * Define your uploaded files here
 * Update this array with your actual file information
 */
const ASSETS_TO_ADD = [
  // Videos
  // Note: S3 structure is video/canva/ for Canva videos
  {
    id: 'drift-into-sleep-video-1',
    name: 'Drift into Sleep - Background Video 1',
    s3Key: 'video/canva/breathe-to-relax-video.mp4',
    type: 'video',
    format: 'mp4',
    allocatedSpace: 'Drift into Sleep',
    notes: 'Main background video for sleep practice'
  },
  {
    id: 'drift-clouds-video',
    name: 'Clouds Video',
    s3Key: 'video/canva/clouds.mp4',
    type: 'video',
    format: 'mp4',
    allocatedSpace: 'Drift into Sleep',
    notes: 'Clouds background video for sleep'
  },
  {
    id: 'drift-rain-video',
    name: 'Rain Video',
    s3Key: 'video/canva/rain.mp4',
    type: 'video',
    format: 'mp4',
    allocatedSpace: 'Drift into Sleep',
    notes: 'Rain background video for sleep'
  },
  {
    id: 'drift-waves-video',
    name: 'Waves Video',
    s3Key: 'video/canva/waves.mp4',
    type: 'video',
    format: 'mp4',
    allocatedSpace: 'Drift into Sleep',
    notes: 'Waves background video for sleep'
  },
  // Audio
  {
    id: 'drift-into-sleep-audio',
    name: 'Drift into Sleep - Audio Track',
    s3Key: 'audio/download.wav',
    type: 'audio',
    format: 'wav',
    allocatedSpace: 'Drift into Sleep',
    notes: 'Ambient audio for sleep practice'
  },
];

/**
 * Generate CDN URL from S3 key
 */
function getCdnUrl(s3Key) {
  return `${CDN_BASE_URL}/${s3Key}`;
}

/**
 * Add a single asset to the database
 */
async function addAsset(asset) {
  const cdnUrl = getCdnUrl(asset.s3Key);
  
  try {
    // Check if asset already exists
    const existing = await pool.query(
      'SELECT id FROM content_assets WHERE id = $1',
      [asset.id]
    );
    
    if (existing.rows.length > 0) {
      console.log(`⚠️  Asset ${asset.id} already exists. Updating...`);
      
      // Update existing asset
      await pool.query(`
        UPDATE content_assets SET
          name = $1,
          s3_key = $2,
          cdn_url = $3,
          type = $4,
          format = $5,
          allocated_space = $6,
          dimensions = $7,
          notes = $8,
          status = 'live',
          updated_at = NOW(),
          published_at = COALESCE(published_at, NOW())
        WHERE id = $9
      `, [
        asset.name,
        asset.s3Key,
        cdnUrl,
        asset.type,
        asset.format,
        asset.allocatedSpace || null,
        asset.dimensions || null,
        asset.notes || null,
        asset.id
      ]);
      
      console.log(`   ✅ Updated: ${asset.name}`);
    } else {
      // Insert new asset
      await pool.query(`
        INSERT INTO content_assets (
          id,
          name,
          s3_key,
          cdn_url,
          type,
          format,
          allocated_space,
          dimensions,
          notes,
          status,
          created_at,
          updated_at,
          published_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'live', NOW(), NOW(), NOW())
      `, [
        asset.id,
        asset.name,
        asset.s3Key,
        cdnUrl,
        asset.type,
        asset.format,
        asset.allocatedSpace || null,
        asset.dimensions || null,
        asset.notes || null
      ]);
      
      console.log(`   ✅ Added: ${asset.name}`);
    }
    
    return {
      success: true,
      asset: {
        ...asset,
        cdnUrl
      }
    };
  } catch (error) {
    console.error(`   ❌ Failed to add ${asset.id}:`, error.message);
    return {
      success: false,
      asset,
      error: error.message
    };
  }
}

/**
 * Main function
 */
async function main() {
  console.log('📦 Adding S3 Assets to Database');
  console.log('=====================================\n');
  console.log(`Bucket: ${S3_BUCKET}`);
  console.log(`CDN: ${CDN_BASE_URL}`);
  console.log(`Region: ${AWS_REGION}\n`);
  
  if (ASSETS_TO_ADD.length === 0) {
    console.log('⚠️  No assets defined in ASSETS_TO_ADD array!');
    console.log('\nPlease edit this script and add your assets:');
    console.log('1. Open scripts/add-s3-assets-to-db.js');
    console.log('2. Update the ASSETS_TO_ADD array with your file information');
    console.log('3. Run this script again\n');
    process.exit(1);
  }
  
  console.log(`Found ${ASSETS_TO_ADD.length} asset(s) to add:\n`);
  
  // Add all assets
  const results = [];
  for (const asset of ASSETS_TO_ADD) {
    console.log(`📤 Processing: ${asset.name}`);
    console.log(`   S3 Key: ${asset.s3Key}`);
    console.log(`   Type: ${asset.type}/${asset.format}`);
    if (asset.allocatedSpace) {
      console.log(`   Space: ${asset.allocatedSpace}`);
    }
    
    const result = await addAsset(asset);
    results.push(result);
    
    if (result.success) {
      console.log(`   CDN URL: ${result.asset.cdnUrl}\n`);
    } else {
      console.log(`   Error: ${result.error}\n`);
    }
  }
  
  // Summary
  console.log('=====================================');
  console.log('📊 Summary');
  console.log('=====================================\n');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successfully added/updated: ${successful.length}`);
  if (failed.length > 0) {
    console.log(`❌ Failed: ${failed.length}`);
  }
  
  if (successful.length > 0) {
    console.log('\n📋 Added Assets:');
    successful.forEach(result => {
      console.log(`\n   ID: ${result.asset.id}`);
      console.log(`   Name: ${result.asset.name}`);
      console.log(`   CDN: ${result.asset.cdnUrl}`);
      console.log(`   Space: ${result.asset.allocatedSpace || 'None'}`);
    });
  }
  
  console.log('\n=====================================\n');
  
  // Test query
  if (successful.length > 0) {
    console.log('🧪 Testing database query...\n');
    try {
      const testResult = await pool.query(`
        SELECT id, name, cdn_url, allocated_space, status 
        FROM content_assets 
        WHERE status = 'live'
        ORDER BY created_at DESC
        LIMIT 5
      `);
      
      console.log('Recent live assets:');
      testResult.rows.forEach(row => {
        console.log(`   - ${row.name} (${row.id})`);
        console.log(`     Space: ${row.allocated_space || 'None'}`);
        console.log(`     CDN: ${row.cdn_url}`);
      });
    } catch (error) {
      console.error('Error testing query:', error.message);
    }
  }
  
  // Close database connection
  await pool.end();
  
  console.log('\n✅ Done! Your assets are now available in the app.');
  console.log('\nTo use them in your app:');
  console.log('   GET /api/content-assets?space=Drift into Sleep');
  console.log('   GET /api/content-assets?set=true&space=Drift into Sleep\n');
}

main().catch(error => {
  console.error('\n❌ Script failed:', error.message);
  console.error(error);
  process.exit(1);
});

