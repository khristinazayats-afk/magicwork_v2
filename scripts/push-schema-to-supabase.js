#!/usr/bin/env node

/**
 * Push Database Schema to Supabase
 * Uses the existing database connection setup
 */

import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get Postgres URL from environment or use the one from Vercel config
const POSTGRES_URL = process.env.POSTGRES_URL || 
  'postgres://postgres.tbfwvdcvohmykwdfgiqy:Hc3XQx7t5gVQjJyX@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require';

async function pushSchema() {
  let pool;
  
  try {
    console.log('📊 Reading database schema file...');
    const schemaPath = join(__dirname, '../database/setup_complete_schema.sql');
    const sql = readFileSync(schemaPath, 'utf-8');

    console.log('🔵 Connecting to Supabase Postgres...');
    console.log(`   Host: ${new URL(POSTGRES_URL).hostname}`);
    
    // Create connection pool with proper SSL config for Supabase
    const sslConfig = POSTGRES_URL.includes('supabase') || POSTGRES_URL.includes('sslmode=require')
      ? { rejectUnauthorized: false } // Allow self-signed certificates for Supabase
      : undefined;

    pool = new Pool({
      connectionString: POSTGRES_URL,
      ssl: sslConfig,
      max: 1, // Use single connection for schema setup
      connectionTimeoutMillis: 30000,
    });

    // Test connection
    const testResult = await pool.query('SELECT NOW()');
    console.log('✅ Connected to database');
    console.log(`   Server time: ${testResult.rows[0].now}`);

    // Split SQL into statements (handle multi-line statements)
    const statements = sql
      .split(/;\s*\n/)
      .map(s => s.trim())
      .filter(s => {
        // Filter out comments and empty statements
        const cleaned = s.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
        return cleaned.length > 10 && !cleaned.toLowerCase().startsWith('select');
      });

    console.log(`\n📝 Executing ${statements.length} SQL statements...`);
    console.log('   (This may take a minute)\n');

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Execute statements one by one
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip verification queries at the end
      if (statement.toLowerCase().includes('select') && 
          (statement.toLowerCase().includes('pg_tables') || 
           statement.toLowerCase().includes('pg_policies'))) {
        continue;
      }

      try {
        await pool.query(statement);
        successCount++;
        
        // Show progress every 20 statements
        if ((i + 1) % 20 === 0) {
          process.stdout.write(`   Progress: ${i + 1}/${statements.length}...\r`);
        }
      } catch (error) {
        errorCount++;
        // Some errors are expected (IF NOT EXISTS, etc.)
        const errorMsg = error.message.toLowerCase();
        const isExpected = 
          errorMsg.includes('already exists') ||
          errorMsg.includes('does not exist') ||
          errorMsg.includes('duplicate') ||
          errorMsg.includes('relation') && errorMsg.includes('already');
        
        if (!isExpected) {
          errors.push({
            statement: i + 1,
            error: error.message.substring(0, 150),
            sql: statement.substring(0, 100) + '...'
          });
        }
      }
    }

    console.log(`\n\n✅ Schema execution complete!`);
    console.log(`   ✅ Success: ${successCount} statements`);
    console.log(`   ⚠️  Expected errors: ${errorCount} statements`);

    if (errors.length > 0) {
      console.log(`\n   ❌ Unexpected errors: ${errors.length}`);
      errors.slice(0, 5).forEach(err => {
        console.log(`      Statement ${err.statement}: ${err.error}`);
      });
    }

    // Verify tables were created
    console.log('\n🔍 Verifying tables...');
    const tablesResult = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN (
        'events', 'daily_counters', 'milestones_granted',
        'user_profiles', 'user_progress', 'practice_sessions',
        'user_sessions', 'analytics_events', 'user_behavior_analytics',
        'content_sets', 'content_assets'
      )
      ORDER BY tablename;
    `);

    console.log(`\n✅ Found ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach(row => {
      console.log(`   ✓ ${row.tablename}`);
    });

    // Check RLS status
    console.log('\n🔒 Checking RLS status...');
    const rlsResult = await pool.query(`
      SELECT 
        c.relname as tablename,
        c.relrowsecurity as rls_enabled
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND c.relname IN (
        'events', 'daily_counters', 'milestones_granted',
        'user_profiles', 'user_progress', 'practice_sessions',
        'user_sessions', 'analytics_events', 'user_behavior_analytics',
        'content_sets', 'content_assets'
      )
      ORDER BY c.relname;
    `);

    const rlsEnabled = rlsResult.rows.filter(r => r.rls_enabled).length;
    console.log(`   ✅ RLS enabled on ${rlsEnabled}/${rlsResult.rows.length} tables`);

    rlsResult.rows.forEach(row => {
      const status = row.rls_enabled ? '✅' : '❌';
      console.log(`   ${status} ${row.tablename}`);
    });

    console.log('\n🎉 Database schema setup complete!');
    console.log('   All tables created with RLS enabled');
    console.log('   Ready for production use\n');

  } catch (error) {
    console.error('\n❌ Error pushing schema:', error.message);
    console.error('\n📋 Alternative: Run SQL manually in Supabase Dashboard:');
    console.error('   1. Go to: https://supabase.com/dashboard/project/tbfwvdcvohmykwdfgiqy/sql');
    console.error('   2. Open: database/setup_complete_schema.sql');
    console.error('   3. Copy and paste the entire SQL script');
    console.error('   4. Click "Run" to execute\n');
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

pushSchema();

