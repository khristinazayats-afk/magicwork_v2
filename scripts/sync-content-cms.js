/**
 * Content CMS Sync Script
 * 
 * Reads from Google Sheets (your CMS) and syncs to PostgreSQL
 * Also triggers exports for assets with status = 'ready'
 */

import { config } from 'dotenv';
import pkg from 'pg';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pkg;

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root
const envPath = join(__dirname, '..', '.env');
config({ path: envPath });

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

/**
 * Fetch data from Google Sheets
 * 
 * Option A: Public sheet (as CSV)
 * Option B: Google Sheets API (more secure)
 */
async function fetchFromGoogleSheets() {
  const SHEET_ID = process.env.GOOGLE_SHEET_ID;
  const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || 'Sheet1';
  
  // Option A: Public CSV export (simpler)
  if (process.env.GOOGLE_SHEET_PUBLIC === 'true') {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`;
    
    const response = await fetch(csvUrl);
    const csvText = await response.text();
    
    return parseCSV(csvText);
  }
  
  // Option B: Google Sheets API (implement if needed)
  throw new Error('Google Sheets API not implemented yet. Use public CSV export or implement API access.');
}

/**
 * Parse CSV to JSON
 */
function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
    const row = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || null;
    });
    
    // Skip empty rows
    if (!row.id) continue;
    
    rows.push(row);
  }
  
  return rows;
}

/**
 * Sync sheet data to PostgreSQL
 */
async function syncToDatabase(sheetRows) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    for (const row of sheetRows) {
      // Map sheet columns to database columns
      const asset = {
        id: row.id,
        name: row.name,
        canva_url: row.canva_url,
        canva_design_id: row.canva_design_id,
        type: row.type,
        format: row.format,
        allocated_space: row.allocated_space,
        status: row.status || 'draft',
        s3_key: row.s3_key,
        cdn_url: row.cdn_url,
        dimensions: row.dimensions,
        file_size_mb: row.file_size_mb ? parseFloat(row.file_size_mb) : null,
        notes: row.notes,
        created_at: row.created_at || new Date().toISOString(),
      };
      
      // Upsert (insert or update)
      await client.query(`
        INSERT INTO content_assets (
          id, name, canva_url, canva_design_id, type, format,
          allocated_space, status, s3_key, cdn_url, dimensions,
          file_size_mb, notes, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          canva_url = EXCLUDED.canva_url,
          canva_design_id = EXCLUDED.canva_design_id,
          type = EXCLUDED.type,
          format = EXCLUDED.format,
          allocated_space = EXCLUDED.allocated_space,
          status = EXCLUDED.status,
          s3_key = EXCLUDED.s3_key,
          cdn_url = EXCLUDED.cdn_url,
          dimensions = EXCLUDED.dimensions,
          file_size_mb = EXCLUDED.file_size_mb,
          notes = EXCLUDED.notes,
          updated_at = NOW()
      `, [
        asset.id, asset.name, asset.canva_url, asset.canva_design_id,
        asset.type, asset.format, asset.allocated_space, asset.status,
        asset.s3_key, asset.cdn_url, asset.dimensions, asset.file_size_mb,
        asset.notes, asset.created_at
      ]);
      
      console.log(`✅ Synced: ${asset.id} (${asset.status})`);
    }
    
    await client.query('COMMIT');
    console.log(`\n✅ Successfully synced ${sheetRows.length} assets to database`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error syncing to database:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Find assets that need to be exported
 */
async function findAssetsToExport() {
  const result = await pool.query(`
    SELECT * FROM content_assets 
    WHERE status = 'ready' 
    ORDER BY created_at ASC
  `);
  
  return result.rows;
}

/**
 * Trigger export for a single asset
 */
async function triggerExport(asset) {
  console.log(`\n📦 Exporting: ${asset.name}`);
  console.log(`   Canva Design: ${asset.canva_design_id}`);
  console.log(`   Type: ${asset.type}/${asset.format}`);
  
  try {
    // Update status to processing
    await pool.query(`
      UPDATE content_assets 
      SET status = 'processing' 
      WHERE id = $1
    `, [asset.id]);
    
    // Call the export API (we'll create this next)
    const exportUrl = process.env.EXPORT_API_URL || 'http://localhost:3001/api/export-canva';
    
    const response = await fetch(exportUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assetId: asset.id,
        canvaDesignId: asset.canva_design_id,
        format: asset.format,
        type: asset.type,
        s3Key: `canva/${asset.type}s/${asset.id}.${asset.format}`
      })
    });
    
    if (!response.ok) {
      throw new Error(`Export API error: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Update database with S3 and CDN URLs
    await pool.query(`
      UPDATE content_assets 
      SET 
        status = 'live',
        s3_key = $2,
        cdn_url = $3,
        file_size_mb = $4,
        last_export_at = NOW(),
        published_at = NOW(),
        export_error = NULL
      WHERE id = $1
    `, [asset.id, result.s3Key, result.cdnUrl, result.fileSizeMB]);
    
    console.log(`   ✅ Exported to: ${result.cdnUrl}`);
    
  } catch (error) {
    console.error(`   ❌ Export failed:`, error.message);
    
    // Update database with error
    await pool.query(`
      UPDATE content_assets 
      SET 
        status = 'error',
        export_error = $2
      WHERE id = $1
    `, [asset.id, error.message]);
  }
}

/**
 * Main sync function
 */
async function main() {
  console.log('🔄 Starting Content CMS Sync...\n');
  
  try {
    // 1. Fetch from Google Sheets
    console.log('📊 Fetching from Google Sheets...');
    const sheetRows = await fetchFromGoogleSheets();
    console.log(`   Found ${sheetRows.length} rows\n`);
    
    // 2. Sync to PostgreSQL
    console.log('💾 Syncing to PostgreSQL...');
    await syncToDatabase(sheetRows);
    
    // 3. Find assets that need export
    console.log('\n🔍 Checking for assets to export...');
    const assetsToExport = await findAssetsToExport();
    
    if (assetsToExport.length === 0) {
      console.log('   No assets need export (all are draft, processing, or live)');
    } else {
      console.log(`   Found ${assetsToExport.length} asset(s) ready for export`);
      
      // 4. Export each asset
      for (const asset of assetsToExport) {
        await triggerExport(asset);
      }
    }
    
    console.log('\n✅ Sync complete!\n');
    
  } catch (error) {
    console.error('\n❌ Sync failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { syncToDatabase, findAssetsToExport, triggerExport };

