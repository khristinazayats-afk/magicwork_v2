#!/usr/bin/env node

/**
 * Test database connection to Supabase PostgreSQL
 * 
 * Usage:
 *   node scripts/test-db-connection.js
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

async function testConnection() {
  console.log('🔌 Testing database connection...\n');
  
  try {
    // Test basic connection
    const result = await pool.query('SELECT 1 as test, NOW() as timestamp');
    console.log('✅ Database connection successful!');
    console.log(`   Server time: ${result.rows[0].timestamp}\n`);
    
    // Check if content_assets table exists
    console.log('📋 Checking content_assets table...');
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'content_assets'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ content_assets table exists\n');
      
      // Get table info
      const tableInfo = await pool.query(`
        SELECT 
          COUNT(*) as total_assets,
          COUNT(CASE WHEN status = 'live' THEN 1 END) as live_assets,
          COUNT(DISTINCT allocated_space) as spaces_with_assets
        FROM content_assets;
      `);
      
      const info = tableInfo.rows[0];
      console.log('📊 Database Statistics:');
      console.log(`   Total assets: ${info.total_assets}`);
      console.log(`   Live assets: ${info.live_assets}`);
      console.log(`   Spaces with assets: ${info.spaces_with_assets}\n`);
      
      // Show recent assets
      const recentAssets = await pool.query(`
        SELECT id, name, type, allocated_space, status, created_at
        FROM content_assets
        ORDER BY created_at DESC
        LIMIT 5;
      `);
      
      if (recentAssets.rows.length > 0) {
        console.log('📦 Recent Assets:');
        recentAssets.rows.forEach(asset => {
          console.log(`   - ${asset.name} (${asset.type})`);
          console.log(`     Space: ${asset.allocated_space || 'None'}`);
          console.log(`     Status: ${asset.status}`);
          console.log(`     Created: ${asset.created_at}`);
          console.log('');
        });
      }
    } else {
      console.log('⚠️  content_assets table does not exist\n');
      console.log('📝 To create the table:');
      console.log('   1. Go to: https://supabase.com/dashboard/project/ejhafhggndirnxmwrtgm/editor');
      console.log('   2. Open: database/schema/content_assets.sql');
      console.log('   3. Copy and paste the SQL into Supabase SQL Editor');
      console.log('   4. Run the query\n');
    }
    
    // Test query for spaces
    console.log('🎯 Testing space query...');
    const spaceTest = await pool.query(`
      SELECT allocated_space, COUNT(*) as count
      FROM content_assets
      WHERE status = 'live'
      GROUP BY allocated_space
      ORDER BY allocated_space;
    `);
    
    if (spaceTest.rows.length > 0) {
      console.log('   Spaces with live assets:');
      spaceTest.rows.forEach(row => {
        console.log(`   - ${row.allocated_space}: ${row.count} asset(s)`);
      });
    } else {
      console.log('   No live assets found for any space');
    }
    
    console.log('\n✅ All tests passed!');
    
  } catch (error) {
    console.error('\n❌ Database connection failed:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    
    if (error.code === 'ENOTFOUND') {
      console.error('\n💡 Possible issues:');
      console.error('   - Check POSTGRES_URL_NON_POOLING in .env file');
      console.error('   - Verify Supabase project is active');
      console.error('   - Check network connection');
    } else if (error.code === '28P01') {
      console.error('\n💡 Authentication failed:');
      console.error('   - Check database password in .env');
      console.error('   - Verify Supabase credentials');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection().catch(error => {
  console.error('\n❌ Unexpected error:', error);
  process.exit(1);
});





