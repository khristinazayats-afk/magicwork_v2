#!/usr/bin/env node

/**
 * View database content in a readable format
 * 
 * Usage:
 *   node scripts/view-database.js
 *   npm run view-db
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

function formatTable(data) {
  if (data.length === 0) {
    console.log('   (no data)');
    return;
  }
  
  // Get column widths
  const columns = Object.keys(data[0]);
  const widths = columns.map(col => {
    const maxContent = Math.max(
      col.length,
      ...data.map(row => String(row[col] || '').length)
    );
    return Math.min(maxContent, 50); // Cap at 50 chars
  });
  
  // Print header
  const header = columns.map((col, i) => col.padEnd(widths[i])).join(' | ');
  console.log('   ' + header);
  console.log('   ' + '-'.repeat(header.length));
  
  // Print rows
  data.forEach(row => {
    const rowStr = columns.map((col, i) => {
      const value = String(row[col] || '').substring(0, 50);
      return value.padEnd(widths[i]);
    }).join(' | ');
    console.log('   ' + rowStr);
  });
}

async function viewDatabase() {
  console.log('📊 Viewing Database Content\n');
  console.log('='.repeat(80) + '\n');
  
  try {
    // Get all assets
    const assets = await pool.query(`
      SELECT 
        id,
        name,
        type,
        format,
        allocated_space,
        status,
        s3_key,
        LEFT(cdn_url, 50) as cdn_url_short,
        created_at::text as created_at
      FROM content_assets
      ORDER BY allocated_space NULLS LAST, type, created_at DESC;
    `);
    
    console.log(`📦 All Assets (${assets.rows.length} total):\n`);
    if (assets.rows.length > 0) {
      formatTable(assets.rows);
    } else {
      console.log('   No assets found in database.\n');
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Summary by space
    const bySpace = await pool.query(`
      SELECT 
        COALESCE(allocated_space, 'Unassigned') as space,
        type,
        COUNT(*) as count,
        COUNT(CASE WHEN status = 'live' THEN 1 END) as live_count
      FROM content_assets
      GROUP BY allocated_space, type
      ORDER BY allocated_space NULLS LAST, type;
    `);
    
    console.log('📊 Summary by Space and Type:\n');
    formatTable(bySpace.rows);
    
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Status summary
    const statusSummary = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM content_assets
      GROUP BY status
      ORDER BY status;
    `);
    
    console.log('📈 Status Summary:\n');
    formatTable(statusSummary.rows);
    
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Recent assets
    const recent = await pool.query(`
      SELECT 
        id,
        name,
        type,
        allocated_space,
        status,
        created_at::text as created_at
      FROM content_assets
      ORDER BY created_at DESC
      LIMIT 10;
    `);
    
    console.log('🕒 Recent Assets (last 10):\n');
    formatTable(recent.rows);
    
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Assets with CDN URLs
    const withCdn = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN cdn_url IS NOT NULL AND cdn_url != '' THEN 1 END) as with_cdn,
        COUNT(CASE WHEN cdn_url IS NULL OR cdn_url = '' THEN 1 END) as missing_cdn
      FROM content_assets
      WHERE status = 'live';
    `);
    
    console.log('🔗 CDN URL Status:\n');
    const cdnInfo = withCdn.rows[0];
    console.log(`   Total live assets: ${cdnInfo.total}`);
    console.log(`   With CDN URL: ${cdnInfo.with_cdn}`);
    console.log(`   Missing CDN URL: ${cdnInfo.missing_cdn}`);
    
    if (cdnInfo.missing_cdn > 0) {
      console.log('\n   ⚠️  Assets missing CDN URLs:');
      const missing = await pool.query(`
        SELECT id, name, s3_key
        FROM content_assets
        WHERE status = 'live'
        AND (cdn_url IS NULL OR cdn_url = '');
      `);
      formatTable(missing.rows);
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
    console.log('💡 Tip: For a visual interface, use Supabase Dashboard:');
    console.log('   https://supabase.com/dashboard/project/ejhafhggndirnxmwrtgm/editor\n');
    
  } catch (error) {
    console.error('\n❌ Error viewing database:');
    console.error(`   ${error.message}\n`);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

viewDatabase().catch(error => {
  console.error('\n❌ Unexpected error:', error);
  process.exit(1);
});





