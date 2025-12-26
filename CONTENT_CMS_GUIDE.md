# 🎨 MagicWork Content CMS - Complete Guide

**Your Sustainable Content Pipeline: Canva → Google Sheets → S3 → CDN → App**

This system lets you manage all your Canva content without ever downloading to your laptop! ✨

---

## 📋 Overview

### The Complete Workflow

```
┌──────────────┐
│   CANVA      │  1. Create/edit design
│   Design     │  2. Get shareable link
└──────┬───────┘
       │
       ↓
┌──────────────┐
│  GOOGLE      │  3. Paste Canva link + metadata
│  SHEETS      │  4. Set status to "ready"
│  (Your CMS)  │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│   SYNC       │  5. Run: npm run cms:sync
│   SCRIPT     │  6. Reads sheet → Updates PostgreSQL
└──────┬───────┘
       │
       ↓
┌──────────────┐
│   EXPORT     │  7. For "ready" assets:
│   API        │     - Exports from Canva
│              │     - Downloads directly to S3
│              │     - Returns CDN URL
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ POSTGRESQL   │  8. Updates asset with CDN URL
│  DATABASE    │  9. Sets status to "live"
└──────┬───────┘
       │
       ↓
┌──────────────┐
│   REACT      │  10. App fetches live assets
│   APP        │  11. Shows content to users
└──────────────┘
```

---

## 🚀 Quick Start (5 Steps)

### Step 1: Set Up Your CMS Spreadsheet (2 mins)

1. **Create a new Google Sheet**: https://sheets.google.com
2. **Name it**: "MagicWork Content CMS"
3. **Add these column headers** (Row 1):

```
id | name | canva_url | canva_design_id | type | format | allocated_space | status | s3_key | cdn_url | dimensions | file_size_mb | notes | created_at | updated_at
```

4. **Make it public** (for simplicity):
   - Click Share → Anyone with link → Viewer
   - Copy the Sheet ID from URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`

5. **Add your first row** (example):

```
id: breathe-to-relax-video
name: Breathe To Relax - Meditation Video
canva_url: https://www.canva.com/design/DAG5m6PdwGw/view
canva_design_id: DAG5m6PdwGw
type: video
format: mp4
allocated_space: Breathe To Relax
status: ready
s3_key: (leave empty - will auto-fill)
cdn_url: (leave empty - will auto-fill)
dimensions: 1080x1920
file_size_mb: (leave empty - will auto-fill)
notes: Soft meditation background
created_at: 2025-11-26
updated_at: 2025-11-26
```

---

### Step 2: Configure Environment Variables (3 mins)

Create `.env` file in your project root:

```bash
# Database (you already have this)
POSTGRES_URL=your_postgres_connection_string

# AWS (you already have this)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET=magicwork-canva-assets
CDN_BASE_URL=https://your-cloudfront-domain.cloudfront.net

# Google Sheets (NEW)
GOOGLE_SHEET_ID=your_sheet_id_from_url
GOOGLE_SHEET_NAME=Sheet1
GOOGLE_SHEET_PUBLIC=true

# Export API (NEW)
EXPORT_API_URL=http://localhost:3001/api/export-canva
```

See `ENV_VARIABLES.md` for detailed setup instructions.

---

### Step 3: Set Up Database (30 seconds)

Run this once to create the database table:

```bash
npm run cms:setup
```

This creates the `content_assets` table in your PostgreSQL database.

---

### Step 4: Test the Sync (1 min)

Sync your Google Sheet to the database:

```bash
npm run cms:sync
```

You should see:
```
🔄 Starting Content CMS Sync...
📊 Fetching from Google Sheets...
   Found 1 rows
💾 Syncing to PostgreSQL...
✅ Synced: breathe-to-relax-video (ready)
✅ Successfully synced 1 assets to database
```

---

### Step 5: Export to S3 (Automated!)

**Option A: Automatic** (recommended)

The `cms:sync` script automatically finds assets with `status=ready` and exports them!

Just run:
```bash
npm run cms:sync
```

And it will:
1. ✅ Export from Canva
2. ✅ Upload to S3
3. ✅ Update CDN URL in database
4. ✅ Change status to "live"

**Option B: Manual API Call**

Start the export API:
```bash
npm run export:api
```

Then trigger export:
```bash
curl -X POST http://localhost:3001/api/export-canva \
  -H "Content-Type: application/json" \
  -d '{
    "assetId": "breathe-to-relax-video",
    "canvaDesignId": "DAG5m6PdwGw",
    "format": "mp4",
    "type": "video",
    "s3Key": "canva/videos/breathe-to-relax-bg.mp4"
  }'
```

---

## 📊 Content Management Workflow

### Adding New Content

1. **Create design in Canva**
2. **Click "Share" → Copy link** (e.g., `https://www.canva.com/design/DAG5m6PdwGw/view`)
3. **Add row to Google Sheet**:
   ```
   id: my-new-video
   name: My New Video
   canva_url: https://www.canva.com/design/DAG5m6PdwGw/view
   canva_design_id: DAG5m6PdwGw
   type: video
   format: mp4
   allocated_space: Home Hero
   status: ready
   ```
4. **Run sync**: `npm run cms:sync`
5. **Done!** Asset is now live at the CDN URL

### Updating Existing Content

1. **Edit design in Canva** (keep same design ID)
2. **Change status in Google Sheet**: `ready` (from `live`)
3. **Run sync**: `npm run cms:sync`
4. **Done!** Updated content is re-exported and live

### Archiving Content

1. **Change status in Google Sheet**: `archived`
2. **Run sync**: `npm run cms:sync`
3. Asset is hidden from app (but still in database)

---

## 🎯 Status Workflow

| Status | Meaning | What Happens |
|--------|---------|--------------|
| `draft` | Just planning | Nothing (ignored by export) |
| `ready` | Ready to export | ✅ Gets exported to S3 on next sync |
| `processing` | Currently exporting | ⏳ Export in progress (don't touch) |
| `live` | Published and live | ✅ Visible in app, served from CDN |
| `archived` | Deprecated | ❌ Hidden from app (keeps history) |
| `error` | Export failed | ⚠️ Check `export_error` column for details |

---

## 🔧 Using Content in Your React App

### Option 1: Direct Database Query

```javascript
// api/content-assets.js already created!

// In your React component:
const response = await fetch('/api/content-assets?space=Breathe To Relax');
const assets = await response.json();

const video = assets.find(a => a.type === 'video');
console.log(video.cdn_url); // https://cdn.../breathe-to-relax-bg.mp4
```

### Option 2: Update Your Assets Config

After exporting, update `src/config/assets.js`:

```javascript
export const assets = {
  breatheToRelaxVideo: {
    cdnUrl: 'https://d1234.cloudfront.net/canva/videos/breathe-to-relax-bg.mp4',
    type: 'video',
    format: 'mp4'
  }
};
```

### Option 3: Dynamic Loading (Best!)

Create a hook to fetch assets:

```javascript
// src/hooks/useContentAssets.js
import { useState, useEffect } from 'react';

export function useContentAssets(space) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/content-assets${space ? `?space=${space}` : ''}`)
      .then(res => res.json())
      .then(data => {
        setAssets(data);
        setLoading(false);
      });
  }, [space]);

  return { assets, loading };
}

// In your component:
function BreatheToRelax() {
  const { assets, loading } = useContentAssets('Breathe To Relax');
  
  const video = assets.find(a => a.type === 'video');
  
  return (
    <video src={video?.cdn_url} autoPlay loop muted />
  );
}
```

---

## 📱 Deployment

### Development
```bash
# Run sync manually when you add/update content
npm run cms:sync
```

### Production (Automated)

**Option A: Cron Job** (recommended)

Add to your server (e.g., Vercel Cron, AWS EventBridge):
```yaml
# vercel.json
{
  "crons": [
    {
      "path": "/api/sync-content",
      "schedule": "0 */6 * * *"  // Every 6 hours
    }
  ]
}
```

**Option B: GitHub Actions**

Create `.github/workflows/sync-content.yml`:
```yaml
name: Sync Canva Content
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:  # Manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run cms:sync
        env:
          POSTGRES_URL: ${{ secrets.POSTGRES_URL }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          # ... other secrets
```

**Option C: Manual** (simplest)

Just run `npm run cms:sync` whenever you add new content!

---

## 🐛 Troubleshooting

### Sync fails with "Cannot read Google Sheet"

**Solution**: Check your Google Sheet is publicly readable or add API credentials.

### Export fails with "Canva API error"

**Solution**: 
1. Check `CANVA_API_KEY` in `.env`
2. Or use Canva's share → download → manual upload to S3 for now
3. Future: Implement Canva MCP server integration

### S3 upload fails

**Solution**: Verify AWS credentials with:
```bash
aws s3 ls s3://$S3_BUCKET
```

### Asset not showing in app

**Solution**: Check status is `live`:
```bash
psql $POSTGRES_URL -c "SELECT id, status FROM content_assets;"
```

---

## 🎉 Benefits of This System

✅ **No laptop downloads** - Everything goes directly from Canva → S3  
✅ **Full visibility** - See all content and status in one Google Sheet  
✅ **Version control** - Track changes with `updated_at` timestamps  
✅ **Fast delivery** - Content served from CloudFront CDN  
✅ **Scalable** - Add 100s of assets without changing code  
✅ **Flexible** - Allocate content to any space in your app  
✅ **Simple workflow** - Edit sheet, run sync, done!  

---

## 📚 File Reference

| File | Purpose |
|------|---------|
| `CONTENT_CMS_TEMPLATE.md` | Google Sheet template and setup |
| `ENV_VARIABLES.md` | All environment variables explained |
| `database/schema/content_assets.sql` | PostgreSQL table schema |
| `scripts/sync-content-cms.js` | Main sync script |
| `api/export-canva.js` | Export API (Canva → S3) |
| `api/content-assets.js` | API to serve content to app |

---

## 🚀 Next Steps

1. [ ] Create your Google Sheet using the template
2. [ ] Add your environment variables to `.env`
3. [ ] Run `npm run cms:setup` to create database
4. [ ] Add your first content row to the sheet
5. [ ] Run `npm run cms:sync` to test
6. [ ] Integrate content into your app using the API
7. [ ] Set up automated sync (cron or GitHub Actions)

**Questions?** Check `CONTENT_CMS_TEMPLATE.md` for detailed examples!










