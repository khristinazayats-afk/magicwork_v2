#!/usr/bin/env node

/**
 * Test S3 file accessibility
 * 
 * Usage:
 *   node scripts/test-s3-access.js
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env
const envPath = join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const S3_BUCKET = process.env.S3_BUCKET || 'magiwork-canva-assets';
const AWS_REGION = process.env.AWS_REGION || 'eu-north-1';
// Use S3 direct URL for testing (CloudFront might still be blocked)
const CDN_BASE_URL = process.env.CDN_BASE_URL || `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com`;
const S3_DIRECT_URL = `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com`;

const testFiles = [
  'canva/videos/clouds.mp4',
  'canva/videos/rain.mp4',
  'canva/videos/waves.mp4',
  'canva/videos/breathe-to-relax-video.mp4',
  'canva/audio/download.wav',
];

async function testFileAccess(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return {
      url,
      status: response.status,
      statusText: response.statusText,
      accessible: response.ok,
      headers: {
        'content-type': response.headers.get('content-type'),
        'content-length': response.headers.get('content-length'),
        'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
      }
    };
  } catch (error) {
    return {
      url,
      status: 'ERROR',
      error: error.message,
      accessible: false
    };
  }
}

async function testAllFiles() {
  console.log('🧪 Testing S3 file accessibility...\n');
  console.log(`Bucket: ${S3_BUCKET}`);
  console.log(`Region: ${AWS_REGION}`);
  console.log(`Base URL: ${CDN_BASE_URL}\n`);
  
  // Test both S3 direct and CDN URLs
  const results = await Promise.all(
    testFiles.map(file => testFileAccess(`${S3_DIRECT_URL}/${file}`))
  );
  
  console.log('Results:');
  console.log('─'.repeat(80));
  
  let allAccessible = true;
  results.forEach(result => {
    const icon = result.accessible ? '✅' : '❌';
    const status = result.status || result.error;
    console.log(`${icon} ${result.url.split('/').pop()}`);
    console.log(`   Status: ${status}`);
    if (result.headers) {
      if (result.headers['access-control-allow-origin']) {
        console.log(`   CORS: ${result.headers['access-control-allow-origin']}`);
      }
      if (result.headers['content-type']) {
        console.log(`   Type: ${result.headers['content-type']}`);
      }
    }
    console.log('');
    
    if (!result.accessible) {
      allAccessible = false;
    }
  });
  
  console.log('─'.repeat(80));
  
  if (allAccessible) {
    console.log('✅ All files are accessible! Your app should work now.');
  } else {
    console.log('❌ Some files are not accessible. You need to:');
    console.log('');
    console.log('1. Make S3 bucket public:');
    console.log('   npm run make-s3-public');
    console.log('');
    console.log('2. Set up CORS:');
    console.log('   npm run setup-s3-cors');
    console.log('');
    console.log('3. Or manually configure in AWS Console (see FIX_S3_PUBLIC_ACCESS.md)');
  }
}

testAllFiles();

