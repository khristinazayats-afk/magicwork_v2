# 🏗️ Magiwork Content CMS - System Architecture

## 🎯 High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        YOU (Content Creator)                     │
│                                                                  │
│  1. Design in Canva                                             │
│  2. Manage in Google Sheets                                     │
│  3. Run: npm run cms:sync                                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    CONTENT MANAGEMENT LAYER                      │
│                                                                  │
│  ┌──────────────┐         ┌──────────────┐                     │
│  │    CANVA     │         │   GOOGLE     │                     │
│  │   Designs    │ ←──────→│   SHEETS     │                     │
│  │              │         │   (Your CMS)  │                     │
│  │ • Video      │         │              │                     │
│  │ • Images     │         │ • id         │                     │
│  │ • GIFs       │         │ • name       │                     │
│  └──────────────┘         │ • canva_url  │                     │
│                           │ • status     │                     │
│                           │ • space      │                     │
│                           │ • cdn_url    │                     │
│                           └──────────────┘                     │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      AUTOMATION LAYER                            │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  scripts/sync-content-cms.js                              │ │
│  │                                                           │ │
│  │  1. Fetch from Google Sheets                             │ │
│  │  2. Sync to PostgreSQL                                   │ │
│  │  3. Find assets with status='ready'                      │ │
│  │  4. Trigger exports for each                             │ │
│  └───────────────────────────────────────────────────────────┘ │
│                             │                                    │
│                             ↓                                    │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  api/export-canva.js                                      │ │
│  │                                                           │ │
│  │  1. Request export from Canva API                        │ │
│  │  2. Get download URL (no laptop!)                        │ │
│  │  3. Stream directly to S3                                │ │
│  │  4. Return CDN URL                                       │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                       STORAGE LAYER                              │
│                                                                  │
│  ┌──────────────┐         ┌──────────────┐                     │
│  │   AWS S3     │────────→│ CLOUDFRONT   │                     │
│  │   Bucket     │         │     CDN      │                     │
│  │              │         │              │                     │
│  │ videos/      │         │ Global Edge  │                     │
│  │ images/      │         │ Locations    │                     │
│  │ gifs/        │         │              │                     │
│  └──────────────┘         └──────────────┘                     │
│                                  │                               │
│                                  │ https://d123...cloudfront.net│
└──────────────────────────────────┼──────────────────────────────┘
                                   │
                                   ↓
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE LAYER                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐│
│  │  PostgreSQL - content_assets table                         ││
│  │                                                            ││
│  │  Stores:                                                   ││
│  │  • Asset metadata (id, name, type, format)                ││
│  │  • Canva source (canva_url, canva_design_id)             ││
│  │  • Storage paths (s3_key, cdn_url)                       ││
│  │  • Usage info (allocated_space, status)                  ││
│  │  • File info (dimensions, file_size_mb)                  ││
│  │  • Timestamps (created_at, updated_at, published_at)     ││
│  └────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ↓
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                                │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐│
│  │  api/content-assets.js                                     ││
│  │                                                            ││
│  │  GET /api/content-assets                                  ││
│  │  GET /api/content-assets/:id                              ││
│  │  GET /api/content-assets?space=Breathe To Relax          ││
│  └────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ↓
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐│
│  │  React App (Magiwork)                                     ││
│  │                                                            ││
│  │  • Fetches assets from API                                ││
│  │  • Renders content from CDN                               ││
│  │  • Shows videos, images, backgrounds                      ││
│  │  • Handles errors gracefully                              ││
│  └────────────────────────────────────────────────────────────┘│
│                                  │                               │
│                                  ↓                               │
│                       ┌──────────────────┐                      │
│                       │   END USERS      │                      │
│                       │ (Your visitors)  │                      │
│                       └──────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Example: Adding "Breathe to Relax" Video

### Step-by-Step Flow

```
1. YOU CREATE DESIGN IN CANVA
   ↓
   Design ID: DAG5m6PdwGw
   Share URL: https://www.canva.com/design/DAG5m6PdwGw/view

2. YOU ADD TO GOOGLE SHEETS
   ↓
   Row: {
     id: "breathe-to-relax-video",
     canva_url: "https://www.canva.com/design/DAG5m6PdwGw/view",
     canva_design_id: "DAG5m6PdwGw",
     allocated_space: "Breathe To Relax",
     status: "ready"
   }

3. YOU RUN: npm run cms:sync
   ↓
   
4. SYNC SCRIPT READS GOOGLE SHEETS
   ↓
   Parses CSV export
   Extracts all rows

5. SYNC SCRIPT UPDATES POSTGRESQL
   ↓
   UPSERT into content_assets table
   Sets status = 'ready'

6. SYNC SCRIPT FINDS "READY" ASSETS
   ↓
   Query: SELECT * WHERE status = 'ready'
   Found: breathe-to-relax-video

7. EXPORT API CALLED
   ↓
   POST /api/export-canva
   Body: {
     assetId: "breathe-to-relax-video",
     canvaDesignId: "DAG5m6PdwGw",
     format: "mp4",
     s3Key: "canva/videos/breathe-to-relax-bg.mp4"
   }

8. CANVA API EXPORTS DESIGN
   ↓
   POST https://api.canva.com/rest/v1/exports
   Returns: export_id

9. EXPORT API POLLS FOR COMPLETION
   ↓
   GET https://api.canva.com/rest/v1/exports/{export_id}
   Status: success
   Returns: download_url

10. EXPORT API DOWNLOADS TO S3 (NOT YOUR LAPTOP!)
    ↓
    Fetch: download_url
    Upload: S3.putObject(bucket, key, stream)
    Result: s3://magiwork-canva-assets/canva/videos/breathe-to-relax-bg.mp4

11. CDN URL GENERATED
    ↓
    https://d1234abcd.cloudfront.net/canva/videos/breathe-to-relax-bg.mp4

12. DATABASE UPDATED
    ↓
    UPDATE content_assets SET
      status = 'live',
      cdn_url = 'https://d1234...cloudfront.net/canva/videos/breathe-to-relax-bg.mp4',
      file_size_mb = 8.5,
      published_at = NOW()
    WHERE id = 'breathe-to-relax-video'

13. GOOGLE SHEETS SYNCED (optional)
    ↓
    Updates cdn_url column in sheet
    Changes status to 'live'

14. REACT APP FETCHES ASSETS
    ↓
    GET /api/content-assets?space=Breathe To Relax
    Returns: [{
      id: "breathe-to-relax-video",
      cdn_url: "https://d1234...cloudfront.net/canva/videos/breathe-to-relax-bg.mp4",
      status: "live"
    }]

15. USER SEES CONTENT
    ↓
    <video src="https://d1234...cloudfront.net/canva/videos/breathe-to-relax-bg.mp4" />
    ↓
    Beautiful meditation video plays! 🎉
```

---

## 🔐 Security & Access Flow

```
┌──────────────┐
│   YOU        │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Google       │  Public read (or API with service account)
│ Sheets       │  
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Sync Script  │  Runs on your machine or server
│              │  Needs: GOOGLE_SHEET_ID, POSTGRES_URL
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Export API   │  Needs: CANVA_API_KEY (OAuth token)
│              │  Requests export from Canva
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ AWS S3       │  Needs: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
│              │  Stores files with public-read ACL
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ CloudFront   │  Public CDN (cached globally)
│ CDN          │  Serves content to end users
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ PostgreSQL   │  Needs: POSTGRES_URL
│              │  Stores metadata
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ React App    │  Public (reads from API)
│              │  Fetches content URLs
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ END USERS    │  Anonymous (public access)
│              │  Views content from CDN
└──────────────┘
```

---

## 📊 Component Responsibilities

### Your Responsibilities
- ✅ Create designs in Canva
- ✅ Add metadata to Google Sheets
- ✅ Run sync when ready to publish
- ✅ Monitor status in spreadsheet

### System Responsibilities
- ✅ Reads Google Sheets automatically
- ✅ Syncs to PostgreSQL
- ✅ Triggers exports from Canva
- ✅ Uploads to S3 (no laptop!)
- ✅ Generates CDN URLs
- ✅ Updates database with URLs
- ✅ Serves content to React app
- ✅ Handles errors gracefully

---

## 🚀 Scaling Considerations

### Current Setup (Perfect for 10-100 assets)
- Manual sync: `npm run cms:sync`
- Google Sheets as CMS
- Direct PostgreSQL queries

### Future Scaling (100-1000+ assets)
- Automated sync: Cron job every 6 hours
- Google Sheets API with service account
- Redis caching layer for API responses
- Webhook triggers for instant updates
- Admin UI for non-technical team members

### Enterprise Scaling (1000+ assets)
- Headless CMS (Contentful, Strapi)
- Asset management UI
- CDN purging on updates
- Asset versioning
- A/B testing support
- Analytics integration

---

## 💡 Key Design Decisions

### Why Google Sheets?
- ✅ Visual interface (no coding needed)
- ✅ Familiar tool (everyone knows it)
- ✅ Real-time collaboration
- ✅ Export to CSV (easy automation)
- ✅ Quick setup (5 minutes)

### Why PostgreSQL + Google Sheets (Hybrid)?
- ✅ Sheets for content management (easy editing)
- ✅ PostgreSQL for app queries (fast, reliable)
- ✅ Best of both worlds

### Why Direct S3 Upload (No Laptop)?
- ✅ Saves bandwidth (no double download)
- ✅ Faster (direct server-to-server)
- ✅ More reliable (no interruption risk)
- ✅ Works on any machine (not tied to your laptop)

### Why CloudFront CDN?
- ✅ Global edge locations (fast worldwide)
- ✅ Automatic caching (reduces S3 costs)
- ✅ HTTPS by default (secure)
- ✅ High availability (99.99% SLA)

---

## 📁 File Structure

```
magiwork/
│
├── 📊 CONTENT MANAGEMENT
│   └── (external) Google Sheets - Your CMS dashboard
│
├── 🗄️ DATABASE
│   └── database/schema/content_assets.sql - Table schema
│
├── 🔄 AUTOMATION
│   ├── scripts/sync-content-cms.js - Main sync script
│   └── api/export-canva.js - Export API
│
├── 🌐 API
│   └── api/content-assets.js - Serve content to app
│
├── ⚛️ REACT APP
│   ├── src/components/
│   │   ├── canva/ - Canva integration components
│   │   └── in-the-space/PracticesTab.jsx - Video integration
│   ├── src/config/assets.js - Asset configuration
│   └── src/hooks/useContentAssets.js - (future) Hook to fetch assets
│
├── 📚 DOCUMENTATION
│   ├── CONTENT_CMS_GUIDE.md - Complete guide
│   ├── CONTENT_CMS_SUMMARY.md - Quick summary
│   ├── CONTENT_CMS_TEMPLATE.md - Google Sheets template
│   ├── ENV_VARIABLES.md - Environment variables
│   └── ARCHITECTURE_DIAGRAM.md - This file!
│
└── 🔧 CONFIGURATION
    ├── .env - Environment variables
    ├── package.json - NPM scripts
    └── canva-assets.json - Asset manifest (alternative to DB)
```

---

## 🎯 Summary

This architecture provides:

✅ **Simplicity** - One command to sync everything  
✅ **Visibility** - Google Sheets shows all content  
✅ **Reliability** - PostgreSQL for production queries  
✅ **Performance** - CloudFront CDN for fast delivery  
✅ **Scalability** - Easy to add automation later  
✅ **Security** - Proper credentials and access control  
✅ **Flexibility** - Works with any Canva content  

**Result**: A professional, production-ready content management system! 🎉










