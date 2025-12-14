# 📋 Content Upload Quick Reference

## 🚀 One-Page Workflow

```
1. Download → 2. Spreadsheet → 3. Upload S3 → 4. Database → 5. Verify
```

### Step-by-Step (5 minutes per asset)

1. **Download** file from Pixabay/Canva/Gemini
   - Save to: `~/Downloads/[source]/filename.ext`

2. **Add to Spreadsheet**
   - Fill columns A-I (Asset ID, Name, Source, File Name, Type, Format, etc.)
   - Status: `downloaded`

3. **Upload to S3**
   ```bash
   # Pixabay
   aws s3 cp ~/Downloads/pixabay/file.mp3 \
     s3://magicwork-canva-assets/audio/Pixabay/file.mp3
   
   # Canva video
   aws s3 cp ~/Downloads/canva/file.mp4 \
     s3://magicwork-canva-assets/video/canva/file.mp4
   
   # Canva audio
   aws s3 cp ~/Downloads/canva/file.wav \
     s3://magicwork-canva-assets/audio/file.wav
   ```

4. **Update Spreadsheet**
   - Fill columns J-L (S3 Key, Bucket, CDN URL)
   - Status: `uploaded`

5. **Register in Database**
   ```bash
   # Edit scripts/add-s3-assets-to-db.js, add your asset, then:
   node scripts/add-s3-assets-to-db.js
   ```

6. **Verify**
   ```bash
   # Test CDN
   curl -I https://cdn.magicwork.app/audio/pixabay/file.mp3
   
   # Test API
   curl "https://your-app.vercel.app/api/content-assets?space=Slow%20Morning"
   ```

7. **Update Spreadsheet**
   - Status: `live`

---

## 📊 Spreadsheet Columns Quick Reference

| Col | Name | Example | Notes |
|-----|------|---------|-------|
| A | Asset ID | `slow-morning-audio-001` | Unique, lowercase |
| B | Asset Name | `Slow Morning - Spring Forest` | Display name |
| C | Source | `Pixabay` | Pixabay/Canva/Gemini |
| D | Source URL | `https://pixabay.com/...` | Original link |
| E | Local File Path | `~/Downloads/pixabay/file.mp3` | Where saved |
| F | File Name | `ambient-spring-forest.mp3` | Actual filename |
| G | File Type | `audio` | audio or video |
| H | Format | `mp3` | mp3/wav/mp4 |
| I | File Size (MB) | `2.8` | Optional |
| J | S3 Key | `audio/Pixabay/file.mp3` or `video/canva/file.mp4` | **Required** |
| K | S3 Bucket | `magicwork-canva-assets` | Always same |
| L | CDN URL | `https://cdn.magicwork.app/...` | Auto-generated |
| M | Allocated Space | `Slow Morning` | One of 9 spaces |
| N | Database ID | `slow-morning-audio-001` | Same as Asset ID |
| O | Status | `live` | downloaded/uploaded/registered/live |
| P | Upload Date | `2025-01-15` | When uploaded |
| Q | Notes | `Looping track` | Optional |
| R | Artist/Author | `Ambient Sounds` | Credit |
| S | License | `Pixabay License` | Usage rights |

---

## 🗂️ S3 Folder Structure

```
magicwork-canva-assets/
├── audio/
│   ├── Pixabay/     ← MP3 files from Pixabay (capitalized)
│   ├── Gemini/       ← WAV files from Google Gemini (capitalized)
│   └── *.wav, *.mp3  ← Audio files from Canva (directly in audio/)
└── video/
    └── canva/        ← Video files from Canva
        └── *.mp4
```

---

## 🎯 9 Practice Spaces

1. **Slow Morning**
2. **Gentle De-Stress**
3. **Take a Walk**
4. **Draw Your Feels**
5. **Move and Cool**
6. **Tap to Ground**
7. **Breathe to Relax**
8. **Get in the Flow State**
9. **Drift into Sleep**

---

## ⚡ Common Commands

### S3 Upload
```bash
# Pixabay audio
aws s3 cp local-file.mp3 s3://magicwork-canva-assets/audio/Pixabay/file.mp3

# Canva video
aws s3 cp local-file.mp4 s3://magicwork-canva-assets/video/canva/file.mp4

# Canva audio
aws s3 cp local-file.wav s3://magicwork-canva-assets/audio/file.wav

# Gemini audio
aws s3 cp local-file.wav s3://magicwork-canva-assets/audio/Gemini/file.wav
```

### S3 List
```bash
aws s3 ls s3://magicwork-canva-assets/audio/Pixabay/
aws s3 ls s3://magicwork-canva-assets/audio/Gemini/
aws s3 ls s3://magicwork-canva-assets/video/canva/
aws s3 ls s3://magicwork-canva-assets/audio/
```

### Test CDN
```bash
curl -I https://cdn.magicwork.app/audio/Pixabay/file.mp3
curl -I https://cdn.magicwork.app/video/canva/file.mp4
```

### Test API
```bash
curl "https://your-app.vercel.app/api/content-assets?space=Slow%20Morning"
```

### Add to Database
```bash
node scripts/add-s3-assets-to-db.js
```

---

## 🐛 Quick Troubleshooting

**File not showing in app?**
1. Check S3: `aws s3 ls s3://magicwork-canva-assets/audio/Pixabay/file.mp3`
2. Check CDN: `curl -I https://cdn.magicwork.app/audio/Pixabay/file.mp3`
3. Check database: Supabase dashboard → content_assets table
4. Check status: Must be `live`
5. Check space: `allocated_space` must match exactly

**CDN returns 403?**
- Check S3 permissions
- Verify CloudFront is active
- Check file path is correct (case-sensitive)

**Database error?**
- Check `.env` has `POSTGRES_URL_NON_POOLING`
- Verify Supabase project is active
- Test connection: `npm run test-db`

---

## ✅ Status Flow

```
downloaded → uploaded → registered → live
```

- **downloaded**: File saved locally, added to spreadsheet
- **uploaded**: File in S3, CDN URL generated
- **registered**: Entry in database, ready to use
- **live**: Verified working in app

---

## 📞 Need Help?

1. Check `CONTENT_UPLOAD_STRATEGY.md` for detailed guide
2. Review troubleshooting section
3. Verify all prerequisites are met
4. Check Supabase dashboard for database issues

---

**Last Updated:** 2025-01-15

