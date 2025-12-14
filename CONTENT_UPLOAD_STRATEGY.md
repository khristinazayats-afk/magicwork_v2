# 📦 Content Upload Strategy - Complete Guide

## 🎯 Overview

This guide provides a **manual, cost-effective content pipeline** for managing audio and video assets from multiple sources (Pixabay, Canva, Google Gemini) and making them available in your MagicWork app.

**Strategy**: Manual download → Manual S3 upload → Database registration → App visibility

---

## 📊 Google Spreadsheet Structure

### Spreadsheet: "MagicWork Content Inventory"

Create a Google Spreadsheet with the following columns:

| Column | Description | Example | Required |
|--------|-------------|---------|----------|
| **A: Asset ID** | Unique identifier | `slow-morning-audio-001` | ✅ Yes |
| **B: Asset Name** | Display name | `Slow Morning - Ambient Track` | ✅ Yes |
| **C: Source** | Where it came from | `Pixabay` / `Canva` / `Google Gemini` | ✅ Yes |
| **D: Source URL** | Original download URL | `https://pixabay.com/music/...` | ⚠️ Optional |
| **E: Local File Path** | Where you saved it locally | `/Users/you/downloads/track.mp3` | ⚠️ Optional |
| **F: File Name** | Actual filename | `ambient-spring-forest.mp3` | ✅ Yes |
| **G: File Type** | `audio` or `video` | `audio` | ✅ Yes |
| **H: Format** | File extension | `mp3` / `wav` / `mp4` | ✅ Yes |
| **I: File Size (MB)** | Size in megabytes | `3.2` | ⚠️ Optional |
| **J: S3 Key** | S3 path after upload | `audio/pixabay/ambient-spring-forest.mp3` | ✅ Yes |
| **K: S3 Bucket** | Which bucket | `magicwork-canva-assets` | ✅ Yes |
| **L: CDN URL** | Final CDN URL | `https://cdn.magicwork.app/audio/...` | ✅ Yes |
| **M: Allocated Space** | Which practice space | `Slow Morning` | ✅ Yes |
| **N: Database ID** | Supabase asset ID | `slow-morning-audio-001` | ✅ Yes |
| **O: Status** | `downloaded` / `uploaded` / `registered` / `live` | `live` | ✅ Yes |
| **P: Upload Date** | When uploaded to S3 | `2025-01-15` | ⚠️ Optional |
| **Q: Notes** | Any additional info | `Looping track, 3min duration` | ⚠️ Optional |
| **R: Artist/Author** | Creator credit | `Ambient Sounds` | ⚠️ Optional |
| **S: License** | Usage rights | `Pixabay License` | ⚠️ Optional |

### Example Row:

```
Asset ID: slow-morning-audio-001
Asset Name: Slow Morning - Spring Forest
Source: Pixabay
Source URL: https://pixabay.com/music/ambient-spring-forest-15846/
Local File Path: /Users/ksvarychevska/Downloads/ambient-spring-forest.mp3
File Name: ambient-spring-forest.mp3
File Type: audio
Format: mp3
File Size (MB): 2.8
S3 Key: audio/pixabay/ambient-spring-forest.mp3
S3 Bucket: magicwork-canva-assets
CDN URL: https://cdn.magicwork.app/audio/pixabay/ambient-spring-forest.mp3
Allocated Space: Slow Morning
Database ID: slow-morning-audio-001
Status: live
Upload Date: 2025-01-15
Notes: Looping ambient track, perfect for morning practice
Artist/Author: Ambient Sounds
License: Pixabay License
```

---

## 🗂️ S3 Bucket Structure

You have **one S3 bucket** (`magicwork-canva-assets`) organized as follows:

### magicwork-canva-assets (eu-north-1) - Single Bucket for All Content

```
magicwork-canva-assets/
├── audio/
│   ├── Pixabay/        ← MP3 files from Pixabay (capitalized)
│   │   ├── ambient-spring-forest.mp3
│   │   ├── meditation-bells.mp3
│   │   └── ...
│   ├── Gemini/         ← WAV files from Google Gemini (capitalized)
│   │   ├── generated-track-001.wav
│   │   └── ...
│   └── *.wav, *.mp3    ← Audio files from Canva (directly in audio/)
│       ├── download.wav
│       └── ...
└── video/
    └── canva/          ← Video files from Canva
        ├── clouds.mp4
        ├── rain.mp4
        ├── waves.mp4
        ├── breathe-to-relax-video.mp4
        └── ...
```

**Notes:**
- Canva videos go in `video/canva/` subfolder
- Canva audio files go directly in `audio/` (no subfolder)
- Pixabay files go in `audio/Pixabay/` subfolder (capitalized)
- Gemini files go in `audio/Gemini/` subfolder (capitalized)

**Benefits:**
- Easy to find files by source
- Clear organization
- Simple to manage permissions
- Easy to track in spreadsheet

---

## 🚀 Complete Setup Guide (From Scratch)

### Step 1: Prerequisites

**Required:**
- ✅ AWS Account with S3 access
- ✅ AWS CLI installed and configured
- ✅ Supabase account (already set up)
- ✅ Google Spreadsheet access
- ✅ Local download folder organized

**Verify AWS CLI:**
```bash
aws --version
aws s3 ls  # Should list your buckets
```

**Verify Supabase Connection:**
```bash
# Check your .env file has these:
POSTGRES_URL_NON_POOLING="postgres://..."
S3_BUCKET="magicwork-canva-assets"
CDN_BASE="https://cdn.magicwork.app"
```
---

### Step 2: Create Google Spreadsheet

1. **Create new Google Spreadsheet**: "MagicWork Content Inventory"
2. **Add all columns** from the structure above (A through S)
3. **Freeze first row** (View → Freeze → 1 row)
4. **Format header row** (bold, background color)
5. **Share with yourself** (or team members if needed)

**Optional: Add Data Validation:**
- Column G (File Type): Dropdown with `audio`, `video`
- Column H (Format): Dropdown with `mp3`, `wav`, `mp4`
- Column M (Allocated Space): Dropdown with your 9 spaces
- Column O (Status): Dropdown with `downloaded`, `uploaded`, `registered`, `live`

---

### Step 3: Set Up S3 Bucket Structure

**Create folders in S3:**

```bash
# List current bucket contents
aws s3 ls s3://magicwork-canva-assets/

# Create folder structure (folders are created automatically when files are uploaded)
# But you can verify structure exists by uploading a placeholder:

# Create audio folders
echo "" | aws s3 cp - s3://magicwork-canva-assets/audio/Pixabay/.gitkeep
echo "" | aws s3 cp - s3://magicwork-canva-assets/audio/Gemini/.gitkeep

# Create video folders
echo "" | aws s3 cp - s3://magicwork-canva-assets/video/canva/.gitkeep
```

**Verify S3 Permissions:**
```bash
# Check bucket policy allows public read (or CloudFront access)
aws s3api get-bucket-policy --bucket magicwork-canva-assets
```

---

### Step 4: Verify Database Schema

**Check if `content_assets` table exists:**

```bash
# Using psql (if installed)
psql $POSTGRES_URL_NON_POOLING -c "\d content_assets"

# Or use Supabase SQL Editor:
# Go to: https://supabase.com/dashboard/project/ejhafhggndirnxmwrtgm/editor
# Run: SELECT * FROM content_assets LIMIT 1;
```

**If table doesn't exist, create it:**

```sql
-- Run this in Supabase SQL Editor
CREATE TABLE IF NOT EXISTS content_assets (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('video', 'image', 'gif', 'audio')),
  format VARCHAR(10) NOT NULL CHECK (format IN ('mp4', 'png', 'jpg', 'gif', 'webm', 'mp3', 'wav')),
  s3_key TEXT,
  cdn_url TEXT,
  allocated_space VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'processing', 'live', 'archived', 'error')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_content_assets_status ON content_assets(status);
CREATE INDEX IF NOT EXISTS idx_content_assets_space ON content_assets(allocated_space);
CREATE INDEX IF NOT EXISTS idx_content_assets_type ON content_assets(type);
```

---

### Step 5: Manual Workflow Pipeline

#### **Workflow Overview:**

```
1. Download → 2. Upload to S3 → 3. Register in Database → 4. Update Spreadsheet → 5. Verify in App
```

#### **Detailed Steps:**

**1. DOWNLOAD CONTENT**

**From Pixabay:**
- Visit Pixabay → Music section
- Download MP3 file
- Save to: `~/Downloads/pixabay/ambient-spring-forest.mp3`
- Note: File name, artist, license info

**From Canva:**
- Open Canva design
- Export as MP4 (video) or PNG/JPG (image)
- Save to: `~/Downloads/canva/slow-morning-bg.mp4`
- Note: Design ID, dimensions, purpose

**From Google Gemini:**
- Generate audio file
- Download as WAV
- Save to: `~/Downloads/gemini/generated-track-001.wav`
- Note: Generation prompt, settings used

**2. UPDATE SPREADSHEET (Row Status: `downloaded`)**

Fill in columns A through I:
- Asset ID (unique, lowercase, hyphens)
- Asset Name (descriptive)
- Source, Source URL, Local File Path
- File Name, File Type, Format, File Size

**3. UPLOAD TO S3**

```bash
# Example: Upload Pixabay audio (goes to magicwork-canva-assets)
aws s3 cp ~/Downloads/pixabay/ambient-spring-forest.mp3 \
  s3://magicwork-canva-assets/audio/Pixabay/ambient-spring-forest.mp3

# Example: Upload Canva video (goes to magicwork-canva-assets)
aws s3 cp ~/Downloads/canva/slow-morning-bg.mp4 \
  s3://magicwork-canva-assets/video/canva/slow-morning-bg.mp4

# Example: Upload Canva audio (goes to magicwork-canva-assets)
aws s3 cp ~/Downloads/canva/download.wav \
  s3://magicwork-canva-assets/audio/download.wav

# Example: Upload Gemini audio (goes to magicwork-canva-assets)
aws s3 cp ~/Downloads/gemini/generated-track-001.wav \
  s3://magicwork-canva-assets/audio/Gemini/generated-track-001.wav
```

**Verify upload:**
```bash
# Check all content in single bucket
aws s3 ls s3://magicwork-canva-assets/video/canva/
aws s3 ls s3://magicwork-canva-assets/audio/
aws s3 ls s3://magicwork-canva-assets/audio/Pixabay/
aws s3 ls s3://magicwork-canva-assets/audio/Gemini/
```

**4. UPDATE SPREADSHEET (Row Status: `uploaded`)**

Fill in columns J through P:
- S3 Key: 
  - For Pixabay: `audio/Pixabay/ambient-spring-forest.mp3` (capitalized)
  - For Gemini: `audio/Gemini/generated-track-001.wav` (capitalized)
  - For Canva audio: `audio/download.wav` (directly in audio/)
  - For Canva video: `video/canva/clouds.mp4` (in canva/ subfolder)
- S3 Bucket: `magicwork-canva-assets` (same for all content)
- CDN URL: `https://cdn.magicwork.app/[s3-key]`
- Allocated Space: `Slow Morning`
- Upload Date: Today's date

**5. REGISTER IN DATABASE**

**Option A: Use the script (Recommended)**

Edit `scripts/add-s3-assets-to-db.js` and add your asset:

```javascript
const ASSETS_TO_ADD = [
  {
    id: 'slow-morning-audio-001',
    name: 'Slow Morning - Spring Forest',
    s3Key: 'audio/Pixabay/ambient-spring-forest.mp3', // For Pixabay (capitalized)
    type: 'audio',
    format: 'mp3',
    allocatedSpace: 'Slow Morning',
    notes: 'Looping ambient track, perfect for morning practice'
  },
  {
    id: 'drift-clouds-video',
    name: 'Clouds Video',
    s3Key: 'video/canva/clouds.mp4', // For Canva - in canva/ subfolder
    type: 'video',
    format: 'mp4',
    allocatedSpace: 'Drift into Sleep',
    notes: 'Clouds background video'
  },
  // Add more assets...
];
```

Run:
```bash
node scripts/add-s3-assets-to-db.js
```

**Option B: Manual SQL (Alternative)**

```sql
-- Run in Supabase SQL Editor
INSERT INTO content_assets (
  id,
  name,
  s3_key,
  cdn_url,
  type,
  format,
  allocated_space,
  status,
  notes,
  created_at,
  updated_at,
  published_at
) VALUES (
  'slow-morning-audio-001',
  'Slow Morning - Spring Forest',
  'audio/pixabay/ambient-spring-forest.mp3',
  'https://cdn.magicwork.app/audio/pixabay/ambient-spring-forest.mp3',
  'audio',
  'mp3',
  'Slow Morning',
  'live',
  'Looping ambient track, perfect for morning practice',
  NOW(),
  NOW(),
  NOW()
);
```

**6. UPDATE SPREADSHEET (Row Status: `registered`)**

Fill in:
- Database ID: `slow-morning-audio-001`
- Status: `live`

**7. VERIFY IN APP**

**Test API endpoint:**
```bash
# Get assets for a space
curl "https://your-app.vercel.app/api/content-assets?space=Slow%20Morning"

# Get content set (visual + audio)
curl "https://your-app.vercel.app/api/content-assets?set=true&space=Slow%20Morning"
```

**Test CDN URL:**
```bash
curl -I https://cdn.magicwork.app/audio/pixabay/ambient-spring-forest.mp3
# Should return: HTTP/2 200
```

**Check in app:**
- Navigate to "Slow Morning" space
- Verify audio plays correctly
- Check that correct asset is displayed

**8. UPDATE SPREADSHEET (Row Status: `live`)**

Mark status as `live` and add any final notes.

---

## 🔧 Helper Scripts

### Script: Bulk Upload from Spreadsheet

Create `scripts/upload-from-spreadsheet.js`:

```javascript
#!/usr/bin/env node
/**
 * Reads a CSV export from Google Spreadsheet and uploads files to S3
 * 
 * Usage:
 *   1. Export spreadsheet as CSV
 *   2. node scripts/upload-from-spreadsheet.js path/to/spreadsheet.csv
 */

import fs from 'fs';
import { execSync } from 'child_process';
import csv from 'csv-parser';

const S3_BUCKET = process.env.S3_BUCKET || 'magicwork-canva-assets';

async function uploadFromCSV(csvPath) {
  const rows = [];
  
  fs.createReadStream(csvPath)
    .pipe(csv())
    .on('data', (row) => {
      if (row.Status === 'downloaded' && row['Local File Path']) {
        rows.push(row);
      }
    })
    .on('end', async () => {
      console.log(`Found ${rows.length} files to upload\n`);
      
      for (const row of rows) {
        const localPath = row['Local File Path'];
        const s3Key = row['S3 Key'];
        
        if (!localPath || !s3Key) {
          console.log(`⚠️  Skipping ${row['Asset Name']}: missing path or S3 key`);
          continue;
        }
        
        try {
          console.log(`📤 Uploading: ${row['Asset Name']}`);
          execSync(`aws s3 cp "${localPath}" s3://${S3_BUCKET}/${s3Key}`, { stdio: 'inherit' });
          console.log(`   ✅ Uploaded: ${s3Key}\n`);
        } catch (error) {
          console.error(`   ❌ Failed: ${error.message}\n`);
        }
      }
      
      console.log('✅ Upload complete!');
      console.log('\nNext steps:');
      console.log('1. Update spreadsheet status to "uploaded"');
      console.log('2. Run: node scripts/add-s3-assets-to-db.js');
    });
}

const csvPath = process.argv[2];
if (!csvPath) {
  console.error('Usage: node scripts/upload-from-spreadsheet.js <csv-file>');
  process.exit(1);
}

uploadFromCSV(csvPath);
```

---

## 📋 Quick Reference Commands

### S3 Operations

```bash
# List all files in a folder
aws s3 ls s3://magicwork-canva-assets/audio/pixabay/ --recursive

# Upload single file
aws s3 cp local-file.mp3 s3://magicwork-canva-assets/audio/Pixabay/file.mp3

# Upload entire folder
aws s3 sync ~/Downloads/pixabay/ s3://magicwork-canva-assets/audio/Pixabay/

# Delete a file
aws s3 rm s3://magicwork-canva-assets/audio/Pixabay/file.mp3

# Check file exists
aws s3 ls s3://magicwork-canva-assets/audio/pixabay/file.mp3
```

### Database Operations

```bash
# Add asset to database
node scripts/add-s3-assets-to-db.js

# Query assets for a space (via API)
curl "https://your-app.vercel.app/api/content-assets?space=Slow%20Morning"

# Query all live assets
curl "https://your-app.vercel.app/api/content-assets"
```

### CDN Verification

```bash
# Test CDN URL
curl -I https://cdn.magicwork.app/audio/pixabay/file.mp3

# Download via CDN (test)
curl -O https://cdn.magicwork.app/audio/pixabay/file.mp3
```

---

## 🐛 Troubleshooting

### Problem: File uploaded but not visible in app

**Check:**
1. ✅ File exists in S3: `aws s3 ls s3://magicwork-canva-assets/audio/pixabay/file.mp3`
2. ✅ CDN URL works: `curl -I https://cdn.magicwork.app/audio/pixabay/file.mp3`
3. ✅ Database entry exists: Check Supabase dashboard
4. ✅ Status is `live`: `SELECT * FROM content_assets WHERE id = 'your-id';`
5. ✅ `allocated_space` matches exactly: `SELECT * FROM content_assets WHERE allocated_space = 'Slow Morning';`

**Fix:**
```sql
-- Update status to live
UPDATE content_assets SET status = 'live' WHERE id = 'your-id';

-- Fix allocated_space
UPDATE content_assets SET allocated_space = 'Slow Morning' WHERE id = 'your-id';
```

---

### Problem: CDN URL returns 403 Forbidden

**Check:**
1. ✅ S3 bucket has public read access OR CloudFront is configured
2. ✅ CloudFront distribution is active
3. ✅ File path matches exactly (case-sensitive)

**Fix:**
```bash
# Make file publicly readable (if not using CloudFront)
aws s3api put-object-acl \
  --bucket magicwork-canva-assets \
  --key audio/pixabay/file.mp3 \
  --acl public-read
```

---

### Problem: Database connection fails

**Check:**
1. ✅ `.env` file has `POSTGRES_URL_NON_POOLING`
2. ✅ Supabase project is active
3. ✅ Network allows connection

**Fix:**
```bash
# Test connection
npm run test-db

# If fails, check Supabase dashboard for connection string
```

---

### Problem: Spreadsheet and database out of sync

**Solution:**
1. Export spreadsheet as CSV
2. Compare with database query:
   ```sql
   SELECT id, name, s3_key, allocated_space, status 
   FROM content_assets 
   WHERE status = 'live'
   ORDER BY allocated_space, type;
   ```
3. Update spreadsheet manually or create sync script

---

## ✅ Checklist: Setting Up New Content

- [ ] Download file from source (Pixabay/Canva/Gemini)
- [ ] Save to organized local folder
- [ ] Add row to spreadsheet (status: `downloaded`)
- [ ] Upload to S3 with correct folder structure
- [ ] Verify upload: `aws s3 ls s3://magicwork-canva-assets/...`
- [ ] Update spreadsheet (status: `uploaded`, add S3 key, CDN URL)
- [ ] Register in database (script or SQL)
- [ ] Update spreadsheet (status: `registered`, add Database ID)
- [ ] Test CDN URL: `curl -I https://cdn.magicwork.app/...`
- [ ] Test API: `curl "https://your-app/api/content-assets?space=..."`
- [ ] Verify in app (navigate to space, check content loads)
- [ ] Update spreadsheet (status: `live`)

---

## 📈 Best Practices

1. **Naming Convention:**
   - Asset IDs: `lowercase-with-hyphens-001`
   - File names: `descriptive-name.mp3` (no spaces)
   - S3 keys: `source-type/folder/file-name.ext`

2. **Organization:**
   - One row per asset in spreadsheet
   - Keep local downloads organized by source
   - Use consistent folder structure in S3

3. **Documentation:**
   - Always fill in "Notes" column
   - Include artist/author credits
   - Note license information

4. **Testing:**
   - Always test CDN URL before marking as `live`
   - Verify in app before considering complete
   - Keep spreadsheet updated at each step

5. **Backup:**
   - Keep local copies of all downloaded files
   - Export spreadsheet regularly as CSV backup
   - Document any manual database changes

---

## 🎯 Next Steps

1. **Create Google Spreadsheet** with the structure above
2. **Set up S3 folder structure** using commands in Step 3
3. **Download your first asset** and follow the workflow
4. **Test end-to-end** to verify everything works
5. **Scale up** by adding more content systematically

---

## 📞 Support

If you encounter issues:
1. Check troubleshooting section above
2. Verify all prerequisites are met
3. Check Supabase dashboard for database issues
4. Verify AWS credentials and permissions
5. Review API logs in Vercel dashboard

---

**Last Updated:** 2025-01-15
**Version:** 1.0

