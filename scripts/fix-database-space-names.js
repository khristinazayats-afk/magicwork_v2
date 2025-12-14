#!/usr/bin/env node

/**
 * Fix space name mismatches in database
 * 
 * Changes:
 * - "Breathe To Relax" → "Breathe to Relax" (to match app)
 * - Updates S3 keys from old format to new format
 * 
 * Usage:
 *   node scripts/fix-database-space-names.js
 */

import pkg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL,
  ssl: process.env.POSTGRES_URL?.includes('sslmode=require') ? {
    rejectUnauthorized: false
  } : false
});

async function fixSpaceNames() {
  console.log('🔧 Fixing Database Space Names and S3 Keys\n');
  console.log('='.repeat(80) + '\n');
  
  try {
    // Fix space name: "Breathe To Relax" → "Breathe to Relax"
    console.log('1️⃣  Fixing space name: "Breathe To Relax" → "Breathe to Relax"\n');
    
    const updateSpaceName = await pool.query(`
      UPDATE content_assets
      SET allocated_space = 'Breathe to Relax'
      WHERE allocated_space = 'Breathe To Relax';
    `);
    
    console.log(`   ✅ Updated ${updateSpaceName.rowCount} asset(s)\n`);
    
    // Fix S3 keys: canva/videos/ → video/canva/ and canva/audio/ → audio/
    console.log('2️⃣  Fixing S3 keys to new structure:\n');
    console.log('   - canva/videos/* → video/canva/*');
    console.log('   - canva/audio/* → audio/*\n');
    
    // Update video S3 keys
    const updateVideoKeys = await pool.query(`
      UPDATE content_assets
      SET s3_key = REPLACE(s3_key, 'canva/videos/', 'video/canva/'),
          cdn_url = REPLACE(cdn_url, 'canva/videos/', 'video/canva/')
      WHERE s3_key LIKE 'canva/videos/%'
         OR cdn_url LIKE '%canva/videos/%';
    `);
    
    console.log(`   ✅ Updated ${updateVideoKeys.rowCount} video asset(s)\n`);
    
    // Update audio S3 keys (canva/audio/ → audio/)
    const updateAudioKeys = await pool.query(`
      UPDATE content_assets
      SET s3_key = REPLACE(s3_key, 'canva/audio/', 'audio/'),
          cdn_url = REPLACE(cdn_url, 'canva/audio/', 'audio/')
      WHERE s3_key LIKE 'canva/audio/%'
         OR cdn_url LIKE '%canva/audio/%';
    `);
    
    console.log(`   ✅ Updated ${updateAudioKeys.rowCount} audio asset(s)\n`);
    
    // Verify changes
    console.log('3️⃣  Verifying changes:\n');
    
    const verify = await pool.query(`
      SELECT 
        allocated_space,
        type,
        s3_key,
        LEFT(cdn_url, 60) as cdn_url_short
      FROM content_assets
      WHERE allocated_space IN ('Breathe to Relax', 'Drift into Sleep')
      ORDER BY allocated_space, type;
    `);
    
    console.log('   Updated assets:');
    verify.rows.forEach(asset => {
      console.log(`   - ${asset.allocated_space} | ${asset.type} | ${asset.s3_key}`);
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ All fixes applied successfully!\n');
    
    console.log('📋 Summary:');
    console.log(`   - Space name fixed: ${updateSpaceName.rowCount} asset(s)`);
    console.log(`   - Video S3 keys updated: ${updateVideoKeys.rowCount} asset(s)`);
    console.log(`   - Audio S3 keys updated: ${updateAudioKeys.rowCount} asset(s)\n`);
    
    console.log('💡 Next steps:');
    console.log('   1. Verify assets appear in app');
    console.log('   2. Check browser console for API calls');
    console.log('   3. Test both "Breathe to Relax" and "Drift into Sleep" spaces\n');
    
  } catch (error) {
    console.error('\n❌ Error fixing database:');
    console.error(`   ${error.message}\n`);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

fixSpaceNames().catch(error => {
  console.error('\n❌ Unexpected error:', error);
  process.exit(1);
});





