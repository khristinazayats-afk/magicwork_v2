#!/usr/bin/env node
/**
 * Run Migrations Directly (Using pg library)
 * 
 * This script uses the pg library directly to run migrations
 * Works with Supabase direct connections
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';
const { Client } = pg;
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
  console.log('🔄 Running Database Migrations...\n');

  // Use non-pooling connection for migrations
  // IMPORTANT: Do NOT hardcode credentials in this repo. Use env vars.
  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error('❌ Missing POSTGRES_URL_NON_POOLING (recommended) or POSTGRES_URL in your environment.');
    console.error('   Example: export POSTGRES_URL_NON_POOLING=\"postgres://postgres.<ref>:<password>@aws-<region>.pooler.supabase.com:5432/postgres?sslmode=require\"');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : {
      rejectUnauthorized: false,
      require: true
    }
  });

  try {
    console.log('🔌 Connecting to Supabase...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Migration 1: Practice Cards
    console.log('📝 Running Migration 1: Practice Cards...');
    const practiceCardsSQL = readFileSync(
      join(__dirname, '../database/migrations/create_practice_cards_table.sql'),
      'utf-8'
    );
    
    // Execute the entire SQL file as one query (PostgreSQL supports this)
    try {
      await client.query(practiceCardsSQL);
    } catch (err) {
      // If tables already exist, that's okay
      if (err.message.includes('already exists') || err.message.includes('duplicate')) {
        console.log('   ℹ️  Some objects already exist (this is okay)');
      } else {
        throw err;
      }
    }
    console.log('✅ Practice Cards migration completed!\n');

    // Migration 2: Usage Tracking
    console.log('📝 Running Migration 2: Usage Tracking...');
    const usageTrackingSQL = readFileSync(
      join(__dirname, '../database/migrations/create_usage_tracking_table.sql'),
      'utf-8'
    );
    
    // Execute the entire SQL file as one query
    try {
      await client.query(usageTrackingSQL);
    } catch (err) {
      // If tables already exist, that's okay
      if (err.message.includes('already exists') || err.message.includes('duplicate')) {
        console.log('   ℹ️  Some objects already exist (this is okay)');
      } else {
        throw err;
      }
    }
    console.log('✅ Usage Tracking migration completed!\n');

    // Verify
    console.log('🔍 Verifying migrations...');
    const cardsResult = await client.query('SELECT COUNT(*) as count FROM practice_cards');
    const sessionsResult = await client.query('SELECT COUNT(*) as count FROM practice_sessions');
    const activeResult = await client.query('SELECT COUNT(*) as count FROM active_sessions');

    console.log(`   📊 practice_cards: ${cardsResult.rows[0].count} rows`);
    console.log(`   📊 practice_sessions: ${sessionsResult.rows[0].count} rows`);
    console.log(`   📊 active_sessions: ${activeResult.rows[0].count} rows`);

    console.log('\n✅ All migrations completed successfully!');
    console.log('\n✨ Database is ready for deployment! 🚀\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    if (error.message.includes('already exists')) {
      console.log('\n⚠️  Some tables may already exist. This is okay!');
      console.log('   The migrations use "IF NOT EXISTS" so they are safe to run multiple times.\n');
    } else {
      console.error('\n💡 Troubleshooting:');
      console.error('   1. Check connection string');
      console.error('   2. Verify Supabase project is active');
      console.error('   3. Check database permissions\n');
      process.exit(1);
    }
  } finally {
    await client.end();
  }
}

runMigrations();

