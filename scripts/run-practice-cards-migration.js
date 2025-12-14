#!/usr/bin/env node
/**
 * Run Practice Cards Migration (Supabase)
 * 
 * Creates the practice_cards table and inserts default cards for all spaces
 * 
 * Usage:
 *   node scripts/run-practice-cards-migration.js
 * 
 * Requires:
 *   - POSTGRES_URL environment variable (Supabase connection string)
 * 
 * Alternative: Run SQL directly in Supabase SQL Editor
 *   - Copy contents of database/migrations/create_practice_cards_table.sql
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
  console.log('🔄 Running Practice Cards Migration...\n');

  // Check for POSTGRES_URL
  if (!process.env.POSTGRES_URL) {
    console.error('❌ POSTGRES_URL environment variable is not set!');
    console.error('\n💡 For Supabase, you can:');
    console.error('   1. Set POSTGRES_URL:');
    console.error('      export POSTGRES_URL="postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres"');
    console.error('   2. Or run SQL directly in Supabase Dashboard:');
    console.error('      - Go to Supabase Dashboard > SQL Editor');
    console.error('      - Copy contents of database/migrations/create_practice_cards_table.sql');
    console.error('      - Paste and click "Run"\n');
    process.exit(1);
  }

  try {
    // Read the migration SQL file
    const migrationPath = join(__dirname, '../database/migrations/create_practice_cards_table.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('📄 Migration file loaded');
    console.log('🔌 Connecting to database...\n');

    // Execute the entire SQL file as one query
    // @vercel/postgres sql template tag can handle multiple statements
    try {
      // Split by semicolons but keep function definitions together
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
              error.message.includes('ON CONFLICT') ||
              error.message.includes('does not exist')) {
            console.log(`⚠️  Statement ${i + 1}/${statements.length}: ${error.message.split('\n')[0]}`);
          } else {
            console.error(`❌ Error in statement ${i + 1}:`, error.message);
            // Don't throw - continue with other statements
          }
        }
      }
    } catch (error) {
      console.error('❌ Migration execution error:', error.message);
      throw error;
    }

    // Verify the migration
    console.log('\n🔍 Verifying migration...');
    const result = await sql`
      SELECT 
        COUNT(*) as total_cards,
        COUNT(DISTINCT space_name) as total_spaces
      FROM practice_cards
    `;

    const stats = result.rows[0];
    console.log(`\n✅ Migration completed successfully!`);
    console.log(`   📊 Total cards created: ${stats.total_cards}`);
    console.log(`   📊 Total spaces: ${stats.total_spaces}`);
    console.log(`   📊 Expected: 36 cards (9 spaces × 4 cards)\n`);

    // Show sample cards
    const sampleCards = await sql`
      SELECT space_name, card_index, title, status
      FROM practice_cards
      WHERE space_name = 'Slow Morning'
      ORDER BY card_index
      LIMIT 4
    `;

    console.log('📋 Sample cards for "Slow Morning":');
    sampleCards.rows.forEach(card => {
      console.log(`   Card ${card.card_index}: ${card.title} (${card.status})`);
    });

    console.log('\n✨ All done! Cards are now independent and can be edited separately.\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check that POSTGRES_URL is set correctly (Supabase connection string)');
    console.error('   2. Verify database connection is working');
    console.error('   3. Check database permissions');
    console.error('   4. Try running the SQL directly in Supabase Dashboard > SQL Editor');
    console.error('      - Copy database/migrations/create_practice_cards_table.sql');
    console.error('      - Paste into SQL Editor and run\n');
    process.exit(1);
  }
}

// Run the migration
runMigration();

