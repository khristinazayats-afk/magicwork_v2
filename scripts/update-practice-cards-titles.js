/**
 * Update Practice Cards Titles in Supabase
 * This script updates all 3 spaces' cards with correct titles matching their videos
 */

import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local in project root
dotenv.config({ path: join(__dirname, '..', '.env.local') });
dotenv.config(); // Also load from default .env if it exists

const POSTGRES_URL = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

if (!POSTGRES_URL) {
  console.error('❌ POSTGRES_URL or POSTGRES_URL_NON_POOLING environment variable is not set!');
  process.exit(1);
}

// Use Client instead of Pool for migrations (like run-migrations-direct.js)
const clientConfig = {
  connectionString: POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : {
    rejectUnauthorized: false,
    require: true
  }
};

const spaces = ['Slow Morning', 'Gentle De-Stress', 'Drift into Sleep'];

const cardData = [
  {
    index: 0,
    title: 'Gentle Clouds',
    description: 'Drift away with gentle clouds moving across the sky.'
  },
  {
    index: 1,
    title: 'Soothing Rain',
    description: 'Find calm in the gentle rhythm of falling rain.'
  },
  {
    index: 2,
    title: 'Calm Waves',
    description: 'Let ocean waves wash away tension and stress.'
  },
  {
    index: 3,
    title: 'Peaceful Forest',
    description: 'Immerse yourself in the tranquility of nature.'
  }
];

async function updateCards() {
  const client = new Client(clientConfig);
  await client.connect();
  
  try {
    console.log('🔄 Updating practice cards in Supabase...\n');
    
    for (const space of spaces) {
      console.log(`📝 Updating ${space}...`);
      
      for (const card of cardData) {
        const result = await client.query(
          `INSERT INTO practice_cards (space_name, card_index, title, description, status, updated_at)
           VALUES ($1, $2, $3, $4, 'active', NOW())
           ON CONFLICT (space_name, card_index)
           DO UPDATE SET
             title = EXCLUDED.title,
             description = EXCLUDED.description,
             updated_at = NOW()
           RETURNING id, title`,
          [space, card.index, card.title, card.description]
        );
        
        if (result.rows[0]) {
          console.log(`  ✅ Card ${card.index + 1}: ${card.title}`);
        }
      }
      
      console.log('');
    }
    
    console.log('✅ All practice cards updated successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - ${spaces.length} spaces updated`);
    console.log(`   - ${cardData.length} cards per space`);
    console.log(`   - Total: ${spaces.length * cardData.length} cards`);
    
  } catch (error) {
    console.error('❌ Error updating practice cards:', error);
    throw error;
  } finally {
    await client.end();
  }
}

updateCards().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

