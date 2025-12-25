#!/usr/bin/env node

/**
 * Make S3 bucket public for canva/ folder
 * 
 * This script sets up a bucket policy to allow public read access
 * to files in the canva/ folder
 * 
 * Usage:
 *   node scripts/make-s3-public.js
 */

import { S3Client, PutBucketPolicyCommand, GetBucketPolicyCommand } from '@aws-sdk/client-s3';
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

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const bucketPolicy = {
  Version: '2012-10-17',
  Statement: [
    {
      Sid: 'PublicReadGetObjectCanva',
      Effect: 'Allow',
      Principal: '*',
      Action: 's3:GetObject',
      Resource: `arn:aws:s3:::${S3_BUCKET}/canva/*`,
    },
    {
      Sid: 'PublicReadGetObjectVideo',
      Effect: 'Allow',
      Principal: '*',
      Action: 's3:GetObject',
      Resource: `arn:aws:s3:::${S3_BUCKET}/video/*`,
    },
    {
      Sid: 'PublicReadGetObjectVideos',
      Effect: 'Allow',
      Principal: '*',
      Action: 's3:GetObject',
      Resource: `arn:aws:s3:::${S3_BUCKET}/videos/*`,
    },
    {
      Sid: 'PublicReadGetObjectAudio',
      Effect: 'Allow',
      Principal: '*',
      Action: 's3:GetObject',
      Resource: `arn:aws:s3:::${S3_BUCKET}/audio/*`,
    },
  ],
};

async function makeBucketPublic() {
  try {
    console.log(`🔧 Setting bucket policy for ${S3_BUCKET}...`);
    console.log(`   Allowing public read access to: canva/*, video/*, audio/*`);
    
    const command = new PutBucketPolicyCommand({
      Bucket: S3_BUCKET,
      Policy: JSON.stringify(bucketPolicy),
    });
    
    await s3Client.send(command);
    
    console.log('✅ Bucket policy set successfully!');
    console.log('\n📋 Policy details:');
    console.log(`   - Public read access enabled for: canva/*, video/*, audio/*`);
    console.log(`   - Bucket: ${S3_BUCKET}`);
    console.log(`   - Region: ${AWS_REGION}`);
    
    console.log('\n🧪 Test URLs:');
    console.log(`   Video: https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/videos/canva/clouds.mp4`);
    console.log(`   Audio: https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/audio/download.wav`);
    
    console.log('\n⚠️  Note: You may also need to:');
    console.log('   1. Disable "Block all public access" in S3 bucket settings');
    console.log('   2. Or ensure CloudFront is properly configured');
    
  } catch (error) {
    if (error.name === 'AccessDenied') {
      console.error('❌ Access Denied. Make sure your AWS credentials have permission to set bucket policies.');
      console.error('   Required permission: s3:PutBucketPolicy');
    } else if (error.name === 'NoSuchBucket') {
      console.error(`❌ Bucket ${S3_BUCKET} not found. Check your S3_BUCKET environment variable.`);
    } else {
      console.error('❌ Error setting bucket policy:', error.message);
      console.error('\n💡 You can also set this manually in AWS Console:');
      console.error('   1. Go to S3 → magiwork-canva-assets → Permissions');
      console.error('   2. Scroll to "Bucket policy"');
      console.error('   3. Paste the policy from FIX_S3_PUBLIC_ACCESS.md');
    }
    process.exit(1);
  }
}

makeBucketPublic();





