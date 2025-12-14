#!/usr/bin/env node

/**
 * Add WAV format support to content_assets table
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
  ssl: {
    rejectUnauthorized: false
  }
});

async function addWavSupport() {
  try {
    console.log('🔧 Adding WAV format support to content_assets table...\n');
    
    // Drop existing constraint
    await pool.query(`
      ALTER TABLE content_assets 
      DROP CONSTRAINT IF EXISTS content_assets_format_check
    `);
    
    // Add new constraint with wav
    await pool.query(`
      ALTER TABLE content_assets 
      ADD CONSTRAINT content_assets_format_check 
      CHECK (format IN ('mp4', 'png', 'jpg', 'gif', 'webm', 'mp3', 'wav'))
    `);
    
    console.log('✅ WAV format support added!\n');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

addWavSupport();





