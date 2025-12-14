/**
 * Export Canva to S3 API Endpoint
 * 
 * This serverless function:
 * 1. Takes a Canva design ID
 * 2. Exports it from Canva (gets download URL)
 * 3. Downloads directly to S3 (never touches your laptop!)
 * 4. Returns the CDN URL
 * 
 * Deploy to: Vercel, AWS Lambda, or run as Express endpoint
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { config } from 'dotenv';

config();

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

/**
 * Export design from Canva
 * 
 * Note: This uses Canva API. If you have Canva MCP server,
 * you can also use that for exports.
 */
async function exportFromCanva(designId, format = 'mp4') {
  const canvaApiUrl = `https://api.canva.com/rest/v1/exports`;
  
  try {
    // Request export
    const exportResponse = await fetch(canvaApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CANVA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        design_id: designId,
        format: format
      })
    });
    
    if (!exportResponse.ok) {
      const error = await exportResponse.text();
      throw new Error(`Canva export failed: ${error}`);
    }
    
    const exportData = await exportResponse.json();
    const exportId = exportData.export.id;
    
    // Poll for export completion
    let attempts = 0;
    const maxAttempts = 30; // 30 attempts = ~1 minute
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
      
      const statusResponse = await fetch(`${canvaApiUrl}/${exportId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.CANVA_API_KEY}`
        }
      });
      
      const statusData = await statusResponse.json();
      
      if (statusData.export.status === 'success') {
        return statusData.export.url; // Download URL
      } else if (statusData.export.status === 'failed') {
        throw new Error(`Canva export failed: ${statusData.export.error}`);
      }
      
      attempts++;
    }
    
    throw new Error('Export timeout: Canva export took too long');
    
  } catch (error) {
    console.error('Error exporting from Canva:', error);
    throw error;
  }
}

/**
 * Download from URL and upload directly to S3
 * (Never saves to disk!)
 */
async function downloadToS3(downloadUrl, s3Key, contentType) {
  try {
    // Fetch the file
    const response = await fetch(downloadUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.statusText}`);
    }
    
    // Get file as buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload to S3
    const uploadParams = {
      Bucket: process.env.S3_BUCKET,
      Key: s3Key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000', // Cache for 1 year
      ACL: 'public-read' // Make publicly accessible
    };
    
    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);
    
    // Return CDN URL
    const cdnUrl = `${process.env.CDN_BASE_URL}/${s3Key}`;
    const fileSizeMB = (buffer.length / (1024 * 1024)).toFixed(2);
    
    return {
      s3Key,
      cdnUrl,
      fileSizeMB: parseFloat(fileSizeMB)
    };
    
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
}

/**
 * Get content type from format
 */
function getContentType(format) {
  const types = {
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'mp3': 'audio/mpeg'
  };
  
  return types[format.toLowerCase()] || 'application/octet-stream';
}

/**
 * Main export handler
 */
export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { assetId, canvaDesignId, format, type, s3Key } = req.body;
  
  if (!canvaDesignId || !format || !s3Key) {
    return res.status(400).json({ 
      error: 'Missing required fields: canvaDesignId, format, s3Key' 
    });
  }
  
  console.log(`📦 Starting export: ${assetId}`);
  console.log(`   Design ID: ${canvaDesignId}`);
  console.log(`   Format: ${format}`);
  console.log(`   Target S3 Key: ${s3Key}`);
  
  try {
    // Step 1: Export from Canva (get download URL)
    console.log('   📤 Requesting export from Canva...');
    const downloadUrl = await exportFromCanva(canvaDesignId, format);
    console.log('   ✅ Export ready, download URL obtained');
    
    // Step 2: Download and upload to S3 (never touches disk!)
    console.log('   ☁️  Uploading to S3...');
    const contentType = getContentType(format);
    const result = await downloadToS3(downloadUrl, s3Key, contentType);
    console.log('   ✅ Upload complete!');
    
    // Step 3: Return result
    console.log(`   🎉 Done! CDN URL: ${result.cdnUrl}`);
    
    return res.status(200).json({
      success: true,
      assetId,
      ...result
    });
    
  } catch (error) {
    console.error('   ❌ Export failed:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// For testing locally with Express
if (import.meta.url === `file://${process.argv[1]}`) {
  import express from 'express';
  
  const app = express();
  app.use(express.json());
  
  app.post('/api/export-canva', handler);
  
  const PORT = process.env.EXPORT_API_PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Export API running on http://localhost:${PORT}`);
    console.log(`   Endpoint: POST /api/export-canva`);
  });
}

