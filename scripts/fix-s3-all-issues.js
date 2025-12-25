#!/usr/bin/env node

/**
 * Fix ALL S3 Issues - Comprehensive Script
 * 
 * This script attempts to fix:
 * 1. Bucket policy (make video/* and audio/* public)
 * 2. Block public access (disable it)
 * 3. CORS configuration
 * 4. Object-level permissions
 * 
 * Usage:
 *   node scripts/fix-s3-all-issues.js
 * 
 * Requirements:
 *   - AWS credentials with s3:PutBucketPolicy, s3:PutBucketPublicAccessBlock, s3:PutBucketCors, s3:PutObjectAcl permissions
 */

import pkg from '@aws-sdk/client-s3';
const { 
  S3Client, 
  PutBucketPolicyCommand,
  PutBucketPublicAccessBlockCommand,
  GetBucketPublicAccessBlockCommand,
  PutBucketCorsCommand,
  PutObjectAclCommand,
  ListObjectsV2Command
} = pkg;
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

// Bucket Policy - Allow public read for canva/*, video/*, audio/*
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
      Sid: 'PublicReadGetObjectAudio',
      Effect: 'Allow',
      Principal: '*',
      Action: 's3:GetObject',
      Resource: `arn:aws:s3:::${S3_BUCKET}/audio/*`,
    },
  ],
};

// CORS Configuration
const corsConfiguration = {
  CORSRules: [
    {
      AllowedHeaders: ['*'],
      AllowedMethods: ['GET', 'HEAD'],
      AllowedOrigins: ['*'],
      ExposeHeaders: ['ETag', 'Content-Length', 'Content-Type', 'Content-Range', 'Accept-Ranges'],
      MaxAgeSeconds: 3000,
    },
  ],
};

async function checkCurrentSettings() {
  console.log('🔍 Checking current S3 settings...\n');
  
  try {
    // Check Block Public Access
    const getPublicAccessBlock = new GetBucketPublicAccessBlockCommand({
      Bucket: S3_BUCKET,
    });
    const publicAccessBlock = await s3Client.send(getPublicAccessBlock);
    console.log('📋 Current Block Public Access settings:');
    console.log(`   BlockPublicAcls: ${publicAccessBlock.PublicAccessBlockConfiguration?.BlockPublicAcls}`);
    console.log(`   IgnorePublicAcls: ${publicAccessBlock.PublicAccessBlockConfiguration?.IgnorePublicAcls}`);
    console.log(`   BlockPublicPolicy: ${publicAccessBlock.PublicAccessBlockConfiguration?.BlockPublicPolicy}`);
    console.log(`   RestrictPublicBuckets: ${publicAccessBlock.PublicAccessBlockConfiguration?.RestrictPublicBuckets}`);
    console.log('');
  } catch (error) {
    if (error.name === 'NoSuchPublicAccessBlockConfiguration') {
      console.log('✅ Block Public Access is already disabled (no configuration found)\n');
    } else {
      console.warn('⚠️  Could not check Block Public Access:', error.message);
    }
  }
}

async function disableBlockPublicAccess() {
  try {
    console.log('🔓 Disabling Block Public Access...');
    
    const command = new PutBucketPublicAccessBlockCommand({
      Bucket: S3_BUCKET,
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: false,
        IgnorePublicAcls: false,
        BlockPublicPolicy: false,
        RestrictPublicBuckets: false,
      },
    });
    
    await s3Client.send(command);
    console.log('✅ Block Public Access disabled successfully!\n');
    return true;
  } catch (error) {
    if (error.name === 'AccessDenied') {
      console.error('❌ Access Denied. Need permission: s3:PutBucketPublicAccessBlock');
      console.error('   You may need to do this manually in AWS Console.\n');
      return false;
    } else {
      console.error('❌ Error disabling Block Public Access:', error.message);
      return false;
    }
  }
}

async function setBucketPolicy() {
  try {
    console.log('📝 Setting bucket policy...');
    
    const command = new PutBucketPolicyCommand({
      Bucket: S3_BUCKET,
      Policy: JSON.stringify(bucketPolicy),
    });
    
    await s3Client.send(command);
    console.log('✅ Bucket policy set successfully!\n');
    return true;
  } catch (error) {
    if (error.name === 'AccessDenied') {
      console.error('❌ Access Denied. Need permission: s3:PutBucketPolicy');
      console.error('   You may need to do this manually in AWS Console.\n');
      return false;
    } else {
      console.error('❌ Error setting bucket policy:', error.message);
      return false;
    }
  }
}

async function setCORS() {
  try {
    console.log('🌐 Setting CORS configuration...');
    
    const command = new PutBucketCorsCommand({
      Bucket: S3_BUCKET,
      CORSConfiguration: corsConfiguration,
    });
    
    await s3Client.send(command);
    console.log('✅ CORS configuration set successfully!\n');
    return true;
  } catch (error) {
    if (error.name === 'AccessDenied') {
      console.error('❌ Access Denied. Need permission: s3:PutBucketCORS');
      console.error('   You may need to do this manually in AWS Console.\n');
      return false;
    } else {
      console.error('❌ Error setting CORS:', error.message);
      return false;
    }
  }
}

async function makeObjectsPublic() {
  try {
    console.log('📁 Making objects in video/canva/ and audio/ public...');
    
    // List objects in video/canva/
    const videoList = new ListObjectsV2Command({
      Bucket: S3_BUCKET,
      Prefix: 'video/canva/',
    });
    const videoObjects = await s3Client.send(videoList);
    
    // List objects in audio/
    const audioList = new ListObjectsV2Command({
      Bucket: S3_BUCKET,
      Prefix: 'audio/',
    });
    const audioObjects = await s3Client.send(audioList);
    
    const allObjects = [
      ...(videoObjects.Contents || []),
      ...(audioObjects.Contents || []),
    ];
    
    if (allObjects.length === 0) {
      console.log('   No objects found in video/canva/ or audio/ folders');
      return true;
    }
    
    console.log(`   Found ${allObjects.length} objects to make public`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const obj of allObjects) {
      try {
        const aclCommand = new PutObjectAclCommand({
          Bucket: S3_BUCKET,
          Key: obj.Key,
          ACL: 'public-read',
        });
        await s3Client.send(aclCommand);
        successCount++;
      } catch (error) {
        if (error.name === 'AccessDenied') {
          console.warn(`   ⚠️  Cannot set ACL for ${obj.Key} - need s3:PutObjectAcl permission`);
          failCount++;
        } else {
          console.warn(`   ⚠️  Error setting ACL for ${obj.Key}: ${error.message}`);
          failCount++;
        }
      }
    }
    
    console.log(`✅ Made ${successCount} objects public`);
    if (failCount > 0) {
      console.log(`⚠️  ${failCount} objects could not be made public (may need manual fix)`);
    }
    console.log('');
    
    return successCount > 0;
  } catch (error) {
    console.error('❌ Error making objects public:', error.message);
    return false;
  }
}

async function fixAllIssues() {
  console.log('🚀 Fixing ALL S3 Issues for:', S3_BUCKET);
  console.log('   Region:', AWS_REGION);
  console.log('');
  
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('❌ AWS credentials not found!');
    console.error('   Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env file');
    process.exit(1);
  }
  
  // Check current settings
  await checkCurrentSettings();
  
  const results = {
    blockPublicAccess: false,
    bucketPolicy: false,
    cors: false,
    objectsPublic: false,
  };
  
  // Step 1: Disable Block Public Access
  results.blockPublicAccess = await disableBlockPublicAccess();
  
  // Step 2: Set Bucket Policy
  results.bucketPolicy = await setBucketPolicy();
  
  // Step 3: Set CORS
  results.cors = await setCORS();
  
  // Step 4: Make objects public
  results.objectsPublic = await makeObjectsPublic();
  
  // Summary
  console.log('📊 Summary:');
  console.log('─'.repeat(50));
  console.log(`   Block Public Access: ${results.blockPublicAccess ? '✅ Fixed' : '❌ Failed (manual fix needed)'}`);
  console.log(`   Bucket Policy: ${results.bucketPolicy ? '✅ Fixed' : '❌ Failed (manual fix needed)'}`);
  console.log(`   CORS Configuration: ${results.cors ? '✅ Fixed' : '❌ Failed (manual fix needed)'}`);
  console.log(`   Object Permissions: ${results.objectsPublic ? '✅ Fixed' : '❌ Failed (manual fix needed)'}`);
  console.log('─'.repeat(50));
  console.log('');
  
  const allFixed = Object.values(results).every(r => r);
  
  if (allFixed) {
    console.log('✅ All S3 issues fixed successfully!');
    console.log('');
    console.log('🧪 Test the fix:');
    console.log(`   curl -I https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/video/canva/clouds.mp4`);
    console.log('');
    console.log('   Expected: HTTP/1.1 200 OK');
  } else {
    console.log('⚠️  Some fixes failed due to insufficient permissions.');
    console.log('');
    console.log('📋 Manual Steps Required:');
    console.log('   1. Go to AWS Console: https://console.aws.amazon.com/s3/');
    console.log('   2. Open bucket: ' + S3_BUCKET);
    console.log('   3. Follow instructions in: IMMEDIATE_S3_FIX.md');
    console.log('');
  }
}

// Run the script
fixAllIssues().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
