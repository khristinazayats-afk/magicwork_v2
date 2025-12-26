# Canva Video Assets

This folder contains video exports from Canva for use in the Magicwork app.

## 🎬 Required Videos

### 1. breathe-to-relax-bg.mp4
**Status**: ⏳ Pending export from Canva

**Canva Design**: "Neutral Soft Meditative Mobile Video"
- [Edit in Canva](https://www.canva.com/d/puTk9iP7KIj90WO)

**Export Settings**:
- Format: MP4 Video
- Quality: 1080p (or 720p for smaller file size)
- Orientation: Portrait (335x595)

**Usage**: Background video for the "Breathe to Relax" space in the In-the-Space experience

**How to Export**:
1. Click the link above to open in Canva
2. Click "Share" → "Download"
3. Select "MP4 Video"
4. Choose quality: 1080p
5. Download
6. Rename to: `breathe-to-relax-bg.mp4`
7. Place in this folder

**File Size Target**: 3-5 MB (compress if larger)

---

## 📁 Additional Videos

You can add more videos here for other spaces or features:

```
canva/videos/
  ├── breathe-to-relax-bg.mp4     (Required - Breathe to Relax background)
  ├── meditation-loop.mp4          (Optional - General meditation)
  ├── gentle-destress-bg.mp4       (Optional - Gentle De-Stress space)
  └── drift-into-sleep-bg.mp4      (Optional - Sleep space)
```

## 🎥 Video Format Guidelines

**Format**: MP4 (H.264 codec)
**Resolution**: 720p-1080p
**Orientation**: Portrait (for mobile)
**File Size**: < 5MB recommended
**Duration**: 10-60 seconds (will loop)
**Audio**: Muted (not needed for backgrounds)

## 🔧 Compression Tools

If your video is too large:
- **Online**: [Cloudinary](https://cloudinary.com/tools/video-compressor)
- **Mac**: HandBrake (free app)
- **Windows**: HandBrake or FFmpeg
- **Command line** (FFmpeg):
  ```bash
  ffmpeg -i input.mp4 -vcodec h264 -acodec aac -vf scale=-2:720 -crf 23 output.mp4
  ```

## ✅ Testing Checklist

After adding a video:
- [ ] File is in this folder
- [ ] File name matches code reference
- [ ] Video plays in browser
- [ ] File size is reasonable (< 5MB)
- [ ] Video loops smoothly
- [ ] Mobile performance is good

---

**See also**: [BREATHE_TO_RELAX_VIDEO_SETUP.md](../../../../BREATHE_TO_RELAX_VIDEO_SETUP.md)










