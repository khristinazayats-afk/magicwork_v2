# ✅ Next Steps - Content Upload Setup

## What You've Completed

✅ Created Google Spreadsheet: [Magiwork Content Inventory](https://docs.google.com/spreadsheets/d/13iAonweyvoDYRCWGQRsd3L9RASSiZEjoUmxfgCBc940/edit?gid=0#gid=0)

✅ Set up S3 bucket structure:
- `magiwork-canva-assets/audio/` - For all audio files (Canva, Pixabay, Gemini)
- `magiwork-canva-assets/video/` - For Canva video files

✅ Added example row in spreadsheet (slow-morning-audio-001)

---

## 🔧 What Needs to Be Done

### 1. Set Up Environment Variables

**Create `.env` file** in your project root:

```bash
# Copy this template and fill in your values
cp ENV_SETUP_CONTENT.md .env
```

Or create `.env` manually with:

```bash
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=eu-north-1
S3_BUCKET=magiwork-canva-assets
CDN_BASE=https://cdn.magiwork.app
CDN_BASE_URL=https://cdn.magiwork.app
POSTGRES_URL_NON_POOLING=postgres://postgres.ejhafhggndirnxmwrtgm:MYXp6u8dlToRXXdV@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require
```

**Also add these to Vercel:**
- Go to: Vercel Dashboard → Settings → Environment Variables
- Add all variables for Production, Preview, and Development

### 2. Install Google Apps Script

1. Open your spreadsheet: https://docs.google.com/spreadsheets/d/13iAonweyvoDYRCWGQRsd3L9RASSiZEjoUmxfgCBc940/edit
2. Go to **Extensions → Apps Script**
3. Paste code from `scripts/google-sheets-content-tracker.gs`
4. Save and authorize
5. Refresh spreadsheet - you should see "Magiwork Content" menu

### 3. Update Spreadsheet Example Row

Your current row has:
- S3 Key: `audio/pixabay/ambient-spring-forest.mp3`
- CDN URL: `https://cdn.magiwork.app/audio/pixabay/ambient-spring-forest.mp3`

**If this is a Pixabay file**, it goes in `magiwork-canva-assets` bucket:
- S3 Key: `audio/Pixabay/ambient-spring-forest.mp3` (capitalized folder)
- S3 Bucket: `magiwork-canva-assets`
- CDN URL: `https://cdn.magiwork.app/audio/Pixabay/ambient-spring-forest.mp3`

**If this is a Canva file**, it goes in `magiwork-canva-assets` bucket:
- S3 Key: `audio/ambient-spring-forest.mp3` (directly in audio/) or `video/canva/clouds.mp4` (in canva/ subfolder)
- S3 Bucket: `magiwork-canva-assets`
- CDN URL: `https://cdn.magiwork.app/audio/ambient-spring-forest.mp3` or `https://cdn.magiwork.app/video/canva/clouds.mp4`

### 4. Verify S3 Structure

Check your buckets:

```bash
# List all content in single bucket
aws s3 ls s3://magiwork-canva-assets/ --recursive
```

Expected structure:
```
magiwork-canva-assets/
├── audio/
│   ├── Pixabay/     ← Pixabay MP3 files (capitalized)
│   ├── Gemini/      ← Gemini WAV files (capitalized)
│   └── *.wav, *.mp3 ← Canva audio files (directly in audio/)
└── video/
    └── canva/       ← Canva video files
        └── *.mp4
```

### 5. Test Database Connection

```bash
# Test database connection (no psql needed!)
npm run test-db
```

This will:
- ✅ Test your database connection
- ✅ Check if `content_assets` table exists
- ✅ Show statistics about your assets

If table doesn't exist, run SQL from `database/schema/content_assets.sql` in Supabase SQL Editor.

### 6. Upload Your First File

Based on your spreadsheet example:

```bash
# If it's a Pixabay file (goes to magiwork-canva-assets)
aws s3 cp /Users/ksvarychevska/Downloads/ambient-spring-forest.mp3 \
  s3://magiwork-canva-assets/audio/Pixabay/ambient-spring-forest.mp3

# If it's a Canva audio file (goes to magiwork-canva-assets)
aws s3 cp /Users/ksvarychevska/Downloads/download.wav \
  s3://magiwork-canva-assets/audio/download.wav

# If it's a Canva video file (goes to magiwork-canva-assets)
aws s3 cp /Users/ksvarychevska/Downloads/clouds.mp4 \
  s3://magiwork-canva-assets/video/canva/clouds.mp4
```

### 7. Register in Database

Edit `scripts/add-s3-assets-to-db.js`:

```javascript
const ASSETS_TO_ADD = [
  {
    id: 'slow-morning-audio-001',
    name: 'Slow Morning - Spring Forest',
    s3Key: 'audio/Pixabay/ambient-spring-forest.mp3', // or 'audio/ambient-spring-forest.mp3' for Canva, or 'video/canva/clouds.mp4' for Canva video
    type: 'audio',
    format: 'mp3',
    allocatedSpace: 'Slow Morning',
    notes: 'Looping ambient track, perfect for morning practice'
  },
];
```

Then run:
```bash
node scripts/add-s3-assets-to-db.js
```

### 8. Verify Everything Works

```bash
# Test CDN URL
curl -I https://cdn.magiwork.app/audio/Pixabay/ambient-spring-forest.mp3
curl -I https://cdn.magiwork.app/video/canva/clouds.mp4

# Test API
curl "https://your-app.vercel.app/api/content-assets?space=Slow%20Morning"
```

---

## 📋 Quick Checklist

- [ ] Create `.env` file with all environment variables
- [ ] Add environment variables to Vercel
- [ ] Install Google Apps Script in spreadsheet
- [ ] Verify S3 bucket structure matches expected layout
- [ ] Test database connection
- [ ] Upload first file to correct S3 bucket
- [ ] Update spreadsheet with S3 key and CDN URL
- [ ] Register asset in database using script
- [ ] Test CDN URL works
- [ ] Test API returns asset
- [ ] Verify asset appears in app

---

## 🐛 Common Issues

### Issue: Script can't find S3_BUCKET
**Fix:** Make sure `.env` has `S3_BUCKET=magiwork-canva-assets`

### Issue: CDN URL returns 403
**Fix:** Check S3 bucket permissions and CloudFront configuration

### Issue: Database connection fails
**Fix:** Verify `POSTGRES_URL_NON_POOLING` is correct in `.env`

### Issue: Wrong S3 path in script
**Fix:** Remember - Canva files use `video/` and `audio/` directly (no `canva/` prefix)

---

## 📚 Reference Documents

- **`CONTENT_UPLOAD_STRATEGY.md`** - Complete guide
- **`CONTENT_UPLOAD_QUICK_REFERENCE.md`** - Quick commands
- **`ENV_SETUP_CONTENT.md`** - Environment variables guide
- **`scripts/add-s3-assets-to-db.js`** - Database registration script

---

## 🎯 Your Current Status

✅ Spreadsheet created and configured
✅ S3 buckets organized
⏳ Environment variables need setup
⏳ Google Apps Script needs installation
⏳ First asset needs upload and registration

**Next immediate action:** Set up `.env` file and install Google Apps Script!

