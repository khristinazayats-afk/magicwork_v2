#!/usr/bin/env node

/**
 * Simple script to upload local files (MP4, WAV, etc.) directly to S3
 * 
 * Usage:
 *   node scripts/upload-files-to-s3.js file1.mp4 file2.mp4 file3.mp4 audio.wav
 *   node scripts/upload-files-to-s3.js --space "Breathe To Relax" file1.mp4 file2.mp4
 */

const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.S3_BUCKET || 'magiwork-canva-assets';
const CDN_BASE = process.env.CDN_BASE_URL || process.env.CDN_BASE || process.env.CDN_DOMAIN || 'https://cdn.magiwork.app';

/**
 * Get content type based on file extension
 */
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.mp4': 'video/mp4',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.m4a': 'audio/mp4',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
  };
  return types[ext] || 'application/octet-stream';
}

/**
 * Generate S3 key based on file type and name
 */
function generateS3Key(filePath, space = null) {
  const fileName = path.basename(filePath);
  const ext = path.extname(fileName).toLowerCase();
  
  // Determine folder based on file type
  let folder = 'uploads';
  if (['.mp4', '.mov', '.avi'].includes(ext)) {
    folder = 'videos';
  } else if (['.mp3', '.wav', '.m4a'].includes(ext)) {
    folder = 'audio';
  } else if (['.png', '.jpg', '.jpeg'].includes(ext)) {
    folder = 'images';
  }
  
  // Add space prefix if provided
  if (space) {
    const spaceSlug = space.toLowerCase().replace(/\s+/g, '-');
    return `${folder}/${spaceSlug}/${fileName}`;
  }
  
  return `${folder}/${fileName}`;
}

/**
 * Upload a single file to S3
 */
async function uploadFile(filePath, space = null) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const fileName = path.basename(filePath);
  const s3Key = generateS3Key(filePath, space);
  const contentType = getContentType(filePath);
  const fileBuffer = fs.readFileSync(filePath);
  const fileSizeMB = (fileBuffer.length / 1024 / 1024).toFixed(2);

  console.log(`\n📤 Uploading: ${fileName}`);
  console.log(`   Size: ${fileSizeMB} MB`);
  console.log(`   S3 Key: ${s3Key}`);
  console.log(`   Content-Type: ${contentType}`);

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: s3Key,
    Body: fileBuffer,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable', // 1 year cache
  });

  await s3Client.send(command);

  const cdnUrl = `${CDN_BASE}/${s3Key}`;
  
  console.log(`   ✅ Uploaded successfully!`);
  console.log(`   🌐 CDN URL: ${cdnUrl}`);

  return {
    fileName,
    s3Key,
    cdnUrl,
    contentType,
    fileSizeMB: parseFloat(fileSizeMB),
    space,
  };
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  let space = null;
  const files = [];
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--space' && args[i + 1]) {
      space = args[i + 1];
      i++; // Skip next arg
    } else {
      files.push(args[i]);
    }
  }

  if (files.length === 0) {
    console.error('❌ No files provided!');
    console.log('\nUsage:');
    console.log('  node scripts/upload-files-to-s3.js file1.mp4 file2.mp4 audio.wav');
    console.log('  node scripts/upload-files-to-s3.js --space "Breathe To Relax" file1.mp4');
    process.exit(1);
  }

  // Validate environment
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('❌ AWS credentials not found!');
    console.log('Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your .env file');
    process.exit(1);
  }

  console.log('🚀 Uploading files to S3');
  console.log('=====================================');
  console.log(`Bucket: ${BUCKET}`);
  console.log(`CDN: ${CDN_BASE}`);
  if (space) {
    console.log(`Space: ${space}`);
  }
  console.log(`Files: ${files.length}`);

  // Upload all files
  const results = [];
  for (const filePath of files) {
    try {
      const result = await uploadFile(filePath, space);
      results.push(result);
    } catch (error) {
      console.error(`\n❌ Failed to upload ${filePath}:`);
      console.error(`   ${error.message}`);
      results.push({ fileName: path.basename(filePath), error: error.message });
    }
  }

  // Summary
  console.log('\n=====================================');
  console.log('📊 Upload Summary');
  console.log('=====================================');
  
  const successful = results.filter(r => r.cdnUrl);
  const failed = results.filter(r => r.error);

  successful.forEach(result => {
    console.log(`\n✅ ${result.fileName}`);
    console.log(`   CDN: ${result.cdnUrl}`);
    console.log(`   Size: ${result.fileSizeMB} MB`);
  });

  if (failed.length > 0) {
    console.log('\n❌ Failed uploads:');
    failed.forEach(result => {
      console.log(`   ${result.fileName}: ${result.error}`);
    });
  }

  console.log(`\n✅ Successful: ${successful.length}`);
  if (failed.length > 0) {
    console.log(`❌ Failed: ${failed.length}`);
  }

  // Output JSON for easy copying
  if (successful.length > 0) {
    console.log('\n📋 CDN URLs (copy these):');
    successful.forEach(result => {
      console.log(`   ${result.cdnUrl}`);
    });
  }

  console.log('\n=====================================\n');
}

main().catch(error => {
  console.error('\n❌ Upload failed:', error.message);
  process.exit(1);
});



