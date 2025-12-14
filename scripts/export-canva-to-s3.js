#!/usr/bin/env node

/**
 * Canva → S3 → CDN Export Pipeline
 * 
 * Exports Canva designs directly to S3 bucket and invalidates CDN cache
 * No local downloads required!
 * 
 * Usage:
 *   npm run export-canva              # Export all assets
 *   npm run export-canva breathe-to-relax-video  # Export specific asset
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Check if AWS SDK is available
let S3Client, PutObjectCommand, CloudFrontClient, CreateInvalidationCommand;
try {
  ({ S3Client, PutObjectCommand } = require('@aws-sdk/client-s3'));
  ({ CloudFrontClient, CreateInvalidationCommand } = require('@aws-sdk/client-cloudfront'));
} catch (error) {
  console.error('⚠️  AWS SDK not installed. Run: npm install @aws-sdk/client-s3 @aws-sdk/client-cloudfront');
  process.exit(1);
}

// Load environment variables
require('dotenv').config();

// Load asset manifest
const manifestPath = path.join(__dirname, '../canva-assets.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Initialize AWS clients
const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
const cfClient = new CloudFrontClient({ region: process.env.AWS_REGION || 'us-east-1' });

/**
 * Export design from Canva using API
 */
async function exportDesignFromCanva(designId, format, quality) {
  const exportUrl = 'https://api.canva.com/rest/v1/exports';
  
  const exportConfig = {
    design_id: designId,
    format: {
      type: format
    }
  };

  // Add quality for videos
  if (format === 'mp4' && quality) {
    exportConfig.format.quality = quality;
  }

  const options = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CANVA_API_KEY}`,
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(exportUrl, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.error) {
            reject(new Error(result.error.message || 'Canva export failed'));
            return;
          }
          // Poll for export completion
          pollExportStatus(result.export.id).then(resolve).catch(reject);
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', reject);
    req.write(JSON.stringify(exportConfig));
    req.end();
  });
}

/**
 * Poll Canva export status until complete
 */
async function pollExportStatus(exportId, maxAttempts = 30) {
  const statusUrl = `https://api.canva.com/rest/v1/exports/${exportId}`;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

    const status = await new Promise((resolve, reject) => {
      const options = {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.CANVA_API_KEY}`
        }
      };

      https.get(statusUrl, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', reject);
    });

    if (status.export.status === 'success') {
      return status.export.url;
    } else if (status.export.status === 'failed') {
      throw new Error('Export failed in Canva');
    }

    // Status is 'in_progress', continue polling
    process.stdout.write('.');
  }

  throw new Error('Export timeout');
}

/**
 * Download file from URL
 */
async function downloadFromUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      // Handle redirects
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadFromUrl(res.headers.location).then(resolve).catch(reject);
      }

      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Upload file to S3
 */
async function uploadToS3(buffer, key, contentType) {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable' // 1 year cache
  });

  await s3Client.send(command);
}

/**
 * Invalidate CloudFront CDN cache
 */
async function invalidateCDN(paths) {
  if (!process.env.CLOUDFRONT_DISTRIBUTION_ID) {
    console.log('⚠️  CLOUDFRONT_DISTRIBUTION_ID not set, skipping CDN invalidation');
    return;
  }

  const command = new CreateInvalidationCommand({
    DistributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
    InvalidationBatch: {
      CallerReference: `canva-export-${Date.now()}`,
      Paths: {
        Quantity: paths.length,
        Items: paths.map(p => `/${p}`)
      }
    }
  });

  await cfClient.send(command);
}

/**
 * Get MIME type for format
 */
function getContentType(format) {
  const types = {
    'mp4': 'video/mp4',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'pdf': 'application/pdf'
  };
  return types[format] || 'application/octet-stream';
}

/**
 * Export single asset
 */
async function exportAsset(asset) {
  console.log(`\n📦 Processing: ${asset.title}`);
  console.log(`   Canva ID: ${asset.canvaDesignId}`);
  console.log(`   Format: ${asset.format} @ ${asset.quality || 'default'}`);

  try {
    // 1. Export from Canva
    process.stdout.write('   → Exporting from Canva');
    const downloadUrl = await exportDesignFromCanva(
      asset.canvaDesignId,
      asset.format,
      asset.quality
    );
    console.log(' ✓');

    // 2. Download file
    process.stdout.write('   → Downloading');
    const buffer = await downloadFromUrl(downloadUrl);
    const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);
    console.log(` ✓ (${sizeMB} MB)`);

    // 3. Upload to S3
    process.stdout.write('   → Uploading to S3');
    const contentType = getContentType(asset.format);
    await uploadToS3(buffer, asset.s3Key, contentType);
    console.log(' ✓');

    // Update asset metadata
    asset.lastUpdated = new Date().toISOString();
    asset.fileSize = buffer.length;
    asset.fileSizeMB = sizeMB;

    console.log(`✅ Success: ${asset.title}`);
    return { success: true, asset, s3Key: asset.s3Key };

  } catch (error) {
    console.log(` ✗`);
    console.error(`❌ Failed: ${asset.title}`);
    console.error(`   Error: ${error.message}`);
    return { success: false, asset, error: error.message };
  }
}

/**
 * Main export function
 */
async function exportAllAssets(filterAssetId = null) {
  console.log('🎨 Canva → S3 → CDN Export Pipeline');
  console.log('=====================================\n');

  // Validate environment
  if (!process.env.CANVA_API_KEY) {
    console.error('❌ CANVA_API_KEY not set in .env file');
    process.exit(1);
  }

  if (!process.env.S3_BUCKET) {
    console.error('❌ S3_BUCKET not set in .env file');
    process.exit(1);
  }

  // Filter assets if specific ID provided
  let assetsToExport = manifest.assets;
  if (filterAssetId) {
    assetsToExport = manifest.assets.filter(a => a.id === filterAssetId);
    if (assetsToExport.length === 0) {
      console.error(`❌ Asset not found: ${filterAssetId}`);
      console.log('\nAvailable assets:');
      manifest.assets.forEach(a => console.log(`  - ${a.id} (${a.title})`));
      process.exit(1);
    }
  }

  console.log(`📋 Exporting ${assetsToExport.length} asset(s)...\n`);

  // Export all assets
  const results = [];
  for (const asset of assetsToExport) {
    const result = await exportAsset(asset);
    results.push(result);
  }

  // Update manifest
  manifest.lastUpdated = new Date().toISOString();
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('\n✅ Updated canva-assets.json');

  // Invalidate CDN cache
  const s3Keys = results.filter(r => r.success).map(r => r.s3Key);
  if (s3Keys.length > 0) {
    try {
      process.stdout.write('\n🌐 Invalidating CDN cache');
      await invalidateCDN(s3Keys);
      console.log(' ✓');
    } catch (error) {
      console.log(` ✗`);
      console.error(`⚠️  CDN invalidation failed: ${error.message}`);
    }
  }

  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log('\n=====================================');
  console.log('🎉 Export Complete!\n');
  console.log(`   ✅ Successful: ${successful}`);
  if (failed > 0) {
    console.log(`   ❌ Failed: ${failed}`);
  }
  console.log(`   📦 Total size: ${results
    .filter(r => r.success)
    .reduce((sum, r) => sum + parseFloat(r.asset.fileSizeMB || 0), 0)
    .toFixed(2)} MB`);
  console.log(`\n   🌐 CDN URL: ${process.env.CDN_BASE_URL || manifest.cdnBaseUrl}`);
  console.log('=====================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

// Run
const assetId = process.argv[2];
exportAllAssets(assetId).catch(error => {
  console.error('\n❌ Pipeline failed:', error.message);
  process.exit(1);
});










