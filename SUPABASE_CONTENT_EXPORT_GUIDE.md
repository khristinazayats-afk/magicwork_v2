# Exporting Supabase Content to Your App

Your app already has infrastructure to load content from Supabase! This guide shows you how to verify and use the content you've uploaded.

## Quick Overview

✅ **What's Already Working:**
- API endpoint `/api/content-assets` queries your Supabase `content_assets` table
- `useContentSet` hook fetches content for spaces
- "Drift into Sleep" and "Breathe to Relax" spaces already use database content
- Videos and audio are automatically loaded from Supabase

## Viewing Your Content

### Option 1: Test Page (Recommended)

Visit this URL in your app:
```
http://localhost:5173/?test=all-content-assets
```

Or on production:
```
https://magicwork-six.vercel.app/?test=all-content-assets
```

This shows:
- All spaces and their asset counts
- Detailed view for each space
- Video/audio previews
- CDN URLs
- Any errors loading content

### Option 2: Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/ejhafhggndirnxmwrtgm/editor
2. Click **"Table Editor"** → **"content_assets"**
3. View all your uploaded files

### Option 3: Command Line Scripts

View all content:
```bash
npm run view-db
# or
node scripts/view-database.js
```

Test database connection:
```bash
node scripts/test-db-connection.js
```

## How Content is Loaded

### Current Implementation

The app uses `useContentSet` hook in `src/components/in-the-space/PracticesTab.jsx`:

```javascript
// Currently only for these spaces:
const isDriftIntoSleep = station?.name === 'Drift into Sleep';
const isBreatheToRelax = station?.name === 'Breathe to Relax';

// Fetch content from Supabase
const { contentSet, loading, error } = useContentSet(spaceName);
```

### What Gets Loaded

For each space, the app fetches:
- **Visual assets**: Videos or images (`type = 'video'` or `type = 'image'`)
- **Audio assets**: Audio files (`type = 'audio'`)
- **All visuals**: Array of all videos for the space

### API Endpoints

The app uses these endpoints:

1. **Get content set (visual + audio pair):**
   ```
   GET /api/content-assets?set=true&space=Drift%20into%20Sleep
   ```

2. **Get all assets for a space:**
   ```
   GET /api/content-assets?space=Drift%20into%20Sleep
   ```

3. **Get specific asset:**
   ```
   GET /api/content-assets?id=asset-id
   ```

## Enabling Database Content for All Spaces

Currently, only "Drift into Sleep" and "Breathe to Relax" use database content. To enable for other spaces:

### Step 1: Update PracticesTab.jsx

Find this section (around line 66-73):

```javascript
// Check if this is "Drift into Sleep" or "Breathe to Relax" space
const isDriftIntoSleep = station?.name === 'Drift into Sleep';
const isBreatheToRelax = station?.name === 'Breathe to Relax';
const gradientKey = gradientMap[station?.name] || 'slowMorning';

// Fetch content assets for spaces that use database content
const spaceNameForContent = isDriftIntoSleep ? 'Drift into Sleep' : (isBreatheToRelax ? 'Breathe to Relax' : null);
const { contentSet, loading: assetsLoading, error: assetsError } = useContentSet(spaceNameForContent);
```

**Change to:**
```javascript
// Fetch content for ALL spaces from database
const gradientKey = gradientMap[station?.name] || 'slowMorning';
const { contentSet, loading: assetsLoading, error: assetsError } = useContentSet(station?.name);
```

### Step 2: Update Video/Audio Logic

Find `getVideoUrl` function (around line 80) and update the condition:

**Current:**
```javascript
if ((isDriftIntoSleep || isBreatheToRelax) && visualsLength > 0) {
  // ... video logic
}
```

**Change to:**
```javascript
if (visualsLength > 0) {
  // ... video logic (works for all spaces now)
}
```

Do the same for `getAudioSource` function (around line 170).

### Step 3: Update Card Generation

Find where cards are created (around line 300) and update:

**Current:**
```javascript
if (isDriftIntoSleep || isBreatheToRelax) {
  // Cards with videos from S3
  // ...
} else {
  // Other cards (no videos)
  // ...
}
```

**Change to:**
```javascript
// Always try to use database content if available
if (contentSet?.visuals?.length > 0 || contentSet?.visual?.cdn_url) {
  // Cards with videos from database
  // ...
} else {
  // Fallback: cards without videos (or use local files)
  // ...
}
```

## Database Schema Requirements

For content to work, ensure your `content_assets` table has:

- `id` - Unique identifier
- `name` - Display name
- `type` - 'video', 'audio', or 'image'
- `format` - 'mp4', 'wav', 'mp3', 'jpg', etc.
- `cdn_url` - Full URL to the file (S3/CDN)
- `s3_key` - S3 key/path (optional but recommended)
- `allocated_space` - Space name (e.g., "Slow Morning")
- `status` - 'live', 'ready', or 'draft' (only 'live' is loaded)
- `created_at` - Timestamp

## Uploading Content

### Via Supabase UI

1. Go to Supabase Dashboard → Table Editor → `content_assets`
2. Click "Insert" → "Insert row"
3. Fill in:
   - `id`: Unique ID (e.g., "slow-morning-video-1")
   - `name`: Display name
   - `type`: "video" or "audio"
   - `format`: "mp4", "wav", etc.
   - `cdn_url`: Full S3/CDN URL
   - `s3_key`: S3 path (optional)
   - `allocated_space`: Exact space name (e.g., "Slow Morning")
   - `status`: "live"
4. Click "Save"

### Via Script

Use the existing script:
```bash
node scripts/add-s3-assets-to-db.js
```

Or create your own script using the pattern in `scripts/add-s3-assets-to-db.js`.

## Testing

### Test Individual Space

Visit:
```
http://localhost:5173/?test=content-assets
```

This shows content for "Drift into Sleep" specifically.

### Test All Spaces

Visit:
```
http://localhost:5173/?test=all-content-assets
```

This shows all spaces and their content.

### Test in Production

1. Join a practice space (e.g., "Drift into Sleep")
2. Click "Join"
3. Videos should load from Supabase
4. Check browser console for any errors

## Troubleshooting

### No Content Showing

1. **Check database:**
   ```bash
   npm run view-db
   ```

2. **Verify status:**
   - Ensure `status = 'live'`
   - Check `allocated_space` matches exactly (case-sensitive)

3. **Check CDN URLs:**
   - Verify `cdn_url` is accessible
   - Test URL in browser
   - Check CORS settings

4. **Check API:**
   ```bash
   curl "https://magicwork-six.vercel.app/api/content-assets?space=Drift%20into%20Sleep"
   ```

### Content Not Loading for Specific Space

1. Check if space name matches exactly:
   ```sql
   SELECT * FROM content_assets 
   WHERE allocated_space = 'Your Space Name' 
   AND status = 'live';
   ```

2. Verify space is enabled in `PracticesTab.jsx` (see "Enabling Database Content" above)

3. Check browser console for errors

### Videos Not Playing

1. Check video format (MP4 recommended)
2. Verify CDN URL is accessible
3. Check browser console for CORS errors
4. Ensure video file exists at the URL

## Next Steps

1. ✅ View your content: `?test=all-content-assets`
2. ✅ Verify files are in Supabase with `status = 'live'`
3. ✅ Test in app: Join "Drift into Sleep" practice
4. ✅ Enable for other spaces (optional, see above)
5. ✅ Upload more content via Supabase UI

## Summary

Your app **already exports and uses** content from Supabase! The infrastructure is in place:

- ✅ API queries Supabase
- ✅ Hook fetches content
- ✅ Components display videos/audio
- ✅ "Drift into Sleep" and "Breathe to Relax" work automatically

Just ensure your files in Supabase have:
- `status = 'live'`
- `allocated_space` set correctly
- `cdn_url` pointing to accessible file

Then visit `?test=all-content-assets` to see everything!


