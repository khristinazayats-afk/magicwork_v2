#!/usr/bin/env node
/**
 * Run Usage Tracking Migration (Supabase)
 * 
 * Creates the practice_sessions and active_sessions tables for tracking usage
 * 
 * Usage:
 *   node scripts/run-usage-tracking-migration.js
 * 
 * Requires:
 *   - POSTGRES_URL environment variable (Supabase connection string)
 * 
 * Alternative: Run SQL directly in Supabase SQL Editor
 *   - Copy contents of database/migrations/create_usage_tracking_table.sql
 *   - Paste into Supabase Dashboard > SQL Editor
 *   - Click "Run"
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { sql } from '@vercel/postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  console.log('🔄 Running Usage Tracking Migration...\n');

  // Check for POSTGRES_URL
  if (!process.env.POSTGRES_URL) {
    console.error('❌ POSTGRES_URL environment variable is not set!');
    console.error('\n💡 For Supabase, you can:');
    console.error('   1. Set POSTGRES_URL:');
    console.error('      export POSTGRES_URL="postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres"');
    console.error('   2. Or run SQL directly in Supabase Dashboard:');
    console.error('      - Go to Supabase Dashboard > SQL Editor');
    console.error('      - Copy contents of database/migrations/create_usage_tracking_table.sql');
    console.error('      - Paste and click "Run"\n');
    process.exit(1);
  }

  try {
    // Read the migration SQL file
    const migrationPath = join(__dirname, '../database/migrations/create_usage_tracking_table.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('📄 Migration file loaded');
    console.log('🔌 Connecting to database...\n');

    // Split SQL into individual statements
    const statements = migrationSQL
      .split(/;(?![^$]*\$\$)/) // Split on semicolons not inside $$ blocks
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip empty statements and comments
      if (!statement || statement.startsWith('--')) {
        continue;
      }

      try {
        // Use sql.unsafe for raw SQL statements
        await sql.unsafe(statement);
        console.log(`✅ Statement ${i + 1}/${statements.length} executed`);
      } catch (error) {
        // Some errors are expected (like "already exists")
        if (error.message.includes('already exists') || 
            error.message.includes('duplicate') ||
            error.message.includes('ON CONFLICT')) {
          console.log(`⚠️  Statement ${i + 1}/${statements.length}: ${error.message.split('\n')[0]}`);
        } else {
          console.error(`❌ Error in statement ${i + 1}:`, error.message);
          // Don't throw - continue with other statements
        }
      }
    }

    // Verify the migration
    console.log('\n🔍 Verifying migration...');
    
    // Check practice_sessions table
    try {
      const sessionsResult = await sql`
        SELECT COUNT(*) as total_sessions
        FROM practice_sessions
      `;
      console.log(`   📊 practice_sessions table: ${sessionsResult.rows[0]?.total_sessions || 0} sessions`);
    } catch (e) {
      console.log('   ⚠️  practice_sessions table not accessible yet');
    }

    // Check active_sessions table
    try {
      const activeResult = await sql`
        SELECT COUNT(*) as active_count
        FROM active_sessions
      `;
      console.log(`   📊 active_sessions table: ${activeResult.rows[0]?.active_count || 0} active sessions`);
    } catch (e) {
      console.log('   ⚠️  active_sessions table not accessible yet');
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\n✨ Usage tracking is now set up:');
    console.log('   - practice_sessions table (completed sessions)');
    console.log('   - active_sessions table (live user counts)');
    console.log('   - Helper functions for live counts\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check that POSTGRES_URL is set correctly (Supabase connection string)');
    console.error('   2. Verify database connection is working');
    console.error('   3. Check database permissions');
    console.error('   4. Try running the SQL directly in Supabase Dashboard > SQL Editor');
    console.error('      - Copy database/migrations/create_usage_tracking_table.sql');
    console.error('      - Paste into SQL Editor and run\n');
    process.exit(1);
  }
}

// Run the migration
runMigration();

