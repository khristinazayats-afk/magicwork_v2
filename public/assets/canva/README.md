# Canva Assets

This folder contains exported designs from Canva for use in the MagicWork app.

## 📁 Folder Structure

```
canva/
├── images/          # Static PNG/JPG exports
│   └── (Place your exported PNG/JPG files here)
│
└── videos/          # MP4/GIF exports
    └── (Place your exported MP4/GIF files here)
```

## 📥 How to Add Designs

1. Open your design in Canva
2. Click "Share" → "Download"
3. Choose format:
   - **PNG** for static images (backgrounds, social posts)
   - **JPG** for photos/email templates
   - **MP4** for videos/animations
   - **GIF** for short loops
4. Save to the appropriate folder:
   - Images → `images/`
   - Videos → `videos/`

## 📝 Naming Convention

Use descriptive names with dashes:
- ✅ `meditation-background-purple.png`
- ✅ `embrace-journey-social-post.png`
- ✅ `breathing-loop-video.mp4`
- ❌ `Design 1.png`
- ❌ `IMG_123.jpg`

## 🎨 Your Available Canva Designs

### Ready to Export:

1. **Neutral Soft Meditative Mobile Video** (DAG5zEkmdtg)
   - Size: 335x595
   - Suggested filename: `meditative-mobile-bg.mp4`
   - Best as: MP4 video
   - [Edit in Canva](https://www.canva.com/d/puTk9iP7KIj90WO)

2. **Instagram Post - Embrace your natural journey** (DAG5m8gyXuo)
   - Size: 400x500
   - Suggested filename: `embrace-journey-post.png`
   - Best as: PNG image
   - [Edit in Canva](https://www.canva.com/d/6FuDkLc9dHxwQDI)

3. **Mobile Video Design** (DAG5m6PdwGw)
   - Size: 335x596
   - Suggested filename: `mobile-video-bg.mp4`
   - Best as: MP4 video
   - [Edit in Canva](https://www.canva.com/d/aOGTkYRpU0kH-C0)

4. **Email Design** (DAG48HIoozA)
   - Size: 376x532
   - Suggested filename: `email-template.jpg`
   - Best as: JPG image
   - [Edit in Canva](https://www.canva.com/d/0tZlCt5TzGxf02q)

## ⚙️ Recommended Export Settings

### For Images (PNG/JPG)
- **Quality**: High (300 DPI)
- **Scale**: 2x or 3x for retina displays
- **Color mode**: RGB
- **Background**: Transparent (PNG) or White (JPG)

### For Videos (MP4)
- **Quality**: 1080p
- **Format**: MP4
- **Codec**: H.264
- **Frame rate**: 30fps

### For Animations (GIF)
- **Quality**: Medium
- **Duration**: Keep under 5 seconds for file size
- **Loop**: Yes

## 🔗 Usage

After placing files here, use them in your components:

```jsx
// Static background
<img src="/assets/canva/images/meditation-bg.png" alt="Meditation" />

// Video background
<video src="/assets/canva/videos/meditative-loop.mp4" autoPlay loop muted />

// With CanvaBackground component
<CanvaBackground
  type="image"
  src="/assets/canva/images/meditation-bg.png"
/>
```

## 📊 File Size Guidelines

- Images: < 1MB (compress with TinyPNG if larger)
- Videos: < 5MB (compress with HandBrake if larger)
- GIFs: < 2MB

## ✅ Quick Checklist

Before adding a new asset:
- [ ] Exported from Canva in correct format
- [ ] Named descriptively
- [ ] Optimized for web (file size)
- [ ] Placed in correct folder
- [ ] Tested in browser

---

**Need help?** See [CANVA_INTEGRATION_GUIDE.md](../../../CANVA_INTEGRATION_GUIDE.md)










