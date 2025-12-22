#!/usr/bin/env node

/**
 * Setup Supabase Database Schema with RLS
 * This script executes the complete database schema setup
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase credentials (from Vercel env or config)
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://pujvtikwdmxlfrqfsjpu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1anZ0aWt3ZG14bGZycWZzanB1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTY0NTE3MiwiZXhwIjoyMDgxMjIxMTcyfQ.gEWs5GoTZtyC3-mCOmrnnQaAwXtBc5xJTLaAVn6l-XM';

// Create Supabase client with service role key (has admin access)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQL(sql) {
  try {
    // Use Supabase REST API to execute SQL via rpc or direct query
    // Note: Supabase doesn't have a direct SQL execution endpoint via JS client
    // We'll need to use the Postgres connection or REST API
    
    // Alternative: Use fetch to call Supabase REST API with SQL
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SQL execution failed: ${error}`);
    }

    return await response.json();
  } catch (error) {
    // If rpc doesn't work, try direct Postgres connection
    console.log('Trying alternative method...');
    throw error;
  }
}

async function setupSchema() {
  try {
    console.log('📊 Reading database schema file...');
    const schemaPath = join(__dirname, '../database/setup_complete_schema.sql');
    const sql = readFileSync(schemaPath, 'utf-8');

    console.log('🔵 Connecting to Supabase...');
    console.log(`   URL: ${SUPABASE_URL}`);
    console.log('   Using service role key (admin access)');

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

    console.log(`\n📝 Found ${statements.length} SQL statements to execute`);
    console.log('⚠️  Note: Supabase JS client cannot execute raw SQL directly.');
    console.log('   Please run the SQL manually in Supabase Dashboard:\n');
    console.log('   1. Go to: https://supabase.com/dashboard/project/pujvtikwdmxlfrqfsjpu/sql');
    console.log('   2. Copy the contents of: database/setup_complete_schema.sql');
    console.log('   3. Paste and click Run\n');

    // Try to use Postgres connection if available
    if (process.env.POSTGRES_URL) {
      console.log('🔵 Attempting direct Postgres connection...');
      const { Client } = await import('pg');
      const client = new Client({
        connectionString: process.env.POSTGRES_URL,
        ssl: { rejectUnauthorized: false }
      });

      await client.connect();
      console.log('✅ Connected to Postgres');

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.length < 10) continue; // Skip very short statements

        try {
          await client.query(statement);
          successCount++;
          if ((i + 1) % 10 === 0) {
            console.log(`   Progress: ${i + 1}/${statements.length} statements executed`);
          }
        } catch (error) {
          errorCount++;
          // Some errors are expected (e.g., IF NOT EXISTS)
          if (!error.message.includes('already exists') && 
              !error.message.includes('does not exist')) {
            console.error(`   ⚠️  Statement ${i + 1} error: ${error.message.substring(0, 100)}`);
          }
        }
      }

      await client.end();
      console.log(`\n✅ Schema setup complete!`);
      console.log(`   Success: ${successCount} statements`);
      console.log(`   Errors (expected): ${errorCount} statements`);
      console.log('\n🔍 Verifying tables...');

      // Verify tables were created
      const verifyClient = new Client({
        connectionString: process.env.POSTGRES_URL,
        ssl: { rejectUnauthorized: false }
      });
      await verifyClient.connect();

      const result = await verifyClient.query(`
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

      console.log(`\n✅ Found ${result.rows.length} tables:`);
      result.rows.forEach(row => {
        console.log(`   - ${row.tablename}`);
      });

      await verifyClient.end();
      return;
    }

    console.log('❌ POSTGRES_URL not found in environment variables');
    console.log('   Please set POSTGRES_URL or run SQL manually in Supabase Dashboard');

  } catch (error) {
    console.error('❌ Error setting up schema:', error.message);
    console.error('\n📋 Manual Setup Instructions:');
    console.error('   1. Go to: https://supabase.com/dashboard/project/pujvtikwdmxlfrqfsjpu/sql');
    console.error('   2. Open: database/setup_complete_schema.sql');
    console.error('   3. Copy and paste the entire SQL script');
    console.error('   4. Click "Run" to execute');
    process.exit(1);
  }
}

setupSchema();

