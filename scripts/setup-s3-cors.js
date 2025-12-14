#!/usr/bin/env node

/**
 * Configure S3 CORS for content assets
 * 
 * This script sets up CORS headers on your S3 bucket to allow
 * browser access to video and audio files
 * 
 * Usage:
 *   node scripts/setup-s3-cors.js
 */

import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env
const envPath = join(__dirname, '..', '.env');
dotenv.config({ path: envPath });

const S3_BUCKET = process.env.S3_BUCKET || 'magicwork-canva-assets';
const AWS_REGION = process.env.AWS_REGION || 'eu-north-1';

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const corsConfiguration = {
  CORSRules: [
    {
      AllowedHeaders: ['*'],
      AllowedMethods: ['GET', 'HEAD'],
      AllowedOrigins: ['*'], // Allow all origins for development
      ExposeHeaders: ['ETag', 'Content-Length', 'Content-Type', 'Content-Range', 'Accept-Ranges'],
      MaxAgeSeconds: 3000,
    },
  ],
};

async function setupCORS() {
  try {
    console.log(`🔧 Setting CORS configuration for ${S3_BUCKET}...`);
    
    // Check current CORS config
    try {
      const getCorsCommand = new GetBucketCorsCommand({ Bucket: S3_BUCKET });
      const currentCors = await s3Client.send(getCorsCommand);
      console.log('📋 Current CORS configuration:', JSON.stringify(currentCors.CORSRules, null, 2));
    } catch (error) {
      if (error.name === 'NoSuchCORSConfiguration') {
        console.log('📋 No existing CORS configuration found');
      } else {
        console.warn('⚠️  Could not read current CORS config:', error.message);
      }
    }
    
    // Set new CORS config
    const command = new PutBucketCorsCommand({
      Bucket: S3_BUCKET,
      CORSConfiguration: corsConfiguration,
    });
    
    await s3Client.send(command);
    
    console.log('✅ CORS configuration set successfully!');
    console.log('\n📋 CORS Rules:');
    console.log('   - Allowed Methods: GET, HEAD');
    console.log('   - Allowed Origins: * (all origins)');
    console.log('   - Allowed Headers: * (all headers)');
    console.log('   - Exposed Headers: ETag, Content-Length, Content-Type, Content-Range, Accept-Ranges');
    
    console.log('\n⚠️  Important: You also need to make the bucket public!');
    console.log('   Run: npm run make-s3-public');
    console.log('   Or follow instructions in FIX_S3_PUBLIC_ACCESS.md');
    
  } catch (error) {
    if (error.name === 'AccessDenied') {
      console.error('❌ Access Denied. Make sure your AWS credentials have permission to set CORS.');
      console.error('   Required permission: s3:PutBucketCORS');
    } else if (error.name === 'NoSuchBucket') {
      console.error(`❌ Bucket ${S3_BUCKET} not found. Check your S3_BUCKET environment variable.`);
    } else {
      console.error('❌ Error setting CORS:', error.message);
      console.error('\n💡 You can also set this manually in AWS Console:');
      console.error('   1. Go to S3 → magicwork-canva-assets → Permissions');
      console.error('   2. Scroll to "Cross-origin resource sharing (CORS)"');
      console.error('   3. Paste the CORS config from INGEST_SETUP.md');
    }
    process.exit(1);
  }
}

setupCORS();





