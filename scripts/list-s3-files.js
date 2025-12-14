#!/usr/bin/env node

/**
 * List files in S3 bucket to help identify uploaded assets
 * 
 * Usage:
 *   node scripts/list-s3-files.js
 *   node scripts/list-s3-files.js --prefix canva/videos
 *   node scripts/list-s3-files.js --prefix canva/audio
 */

import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const BUCKET = process.env.S3_BUCKET || 'magicwork-canva-assets';
const AWS_REGION = process.env.AWS_REGION || 'eu-north-1';

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function listFiles(prefix = '') {
  console.log(`📂 Listing files in s3://${BUCKET}/${prefix}\n`);
  
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: prefix,
    });
    
    const response = await s3Client.send(command);
    
    if (!response.Contents || response.Contents.length === 0) {
      console.log('   No files found.\n');
      return [];
    }
    
    console.log(`Found ${response.Contents.length} file(s):\n`);
    
    const files = response.Contents.map(item => {
      const sizeMB = (item.Size / 1024 / 1024).toFixed(2);
      const lastModified = new Date(item.LastModified).toLocaleString();
      
      console.log(`   📄 ${item.Key}`);
      console.log(`      Size: ${sizeMB} MB`);
      console.log(`      Modified: ${lastModified}\n`);
      
      return {
        key: item.Key,
        size: item.Size,
        sizeMB: parseFloat(sizeMB),
        lastModified: item.LastModified,
      };
    });
    
    return files;
  } catch (error) {
    console.error('❌ Error listing files:', error.message);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  let prefix = '';
  
  // Parse --prefix argument
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--prefix' && args[i + 1]) {
      prefix = args[i + 1];
      break;
    }
  }
  
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('❌ AWS credentials not found!');
    console.log('Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your .env file');
    process.exit(1);
  }
  
  console.log('🔍 S3 File Lister');
  console.log('=====================================\n');
  console.log(`Bucket: ${BUCKET}`);
  console.log(`Region: ${AWS_REGION}`);
  if (prefix) {
    console.log(`Prefix: ${prefix}`);
  }
  console.log('');
  
  try {
    const files = await listFiles(prefix);
    
    if (files.length > 0) {
      console.log('=====================================');
      console.log('💡 Next Steps:');
      console.log('=====================================\n');
      console.log('1. Copy the file keys (paths) above');
      console.log('2. Edit scripts/add-s3-assets-to-db.js');
      console.log('3. Add your files to the ASSETS_TO_ADD array');
      console.log('4. Run: node scripts/add-s3-assets-to-db.js\n');
    }
  } catch (error) {
    console.error('\n❌ Failed:', error.message);
    process.exit(1);
  }
}

main();

