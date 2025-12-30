# 🚀 MagicWork Complete Startup Guide

Getting the meditation app fully operational with all generated content.

## 📋 Prerequisites

- **Node.js:** 18.0.0 or higher
- **npm:** 9.0.0 or higher
- **Git:** For version control
- **4GB+ RAM:** For smooth asset generation

## ⚡ Quick Start (2 minutes)

```bash
# 1. Clone and navigate
git clone <repo-url>
cd magicwork-main

# 2. Install dependencies
npm install

# 3. Generate ALL assets (images, badges, previews)
npm run generate:all

# 4. Start development server
npm run dev

# 5. Open in browser
# Visit: http://localhost:4000
```

✅ **That's it!** All images and previews will be visible in the app.

## 🎨 Full Setup with Optional Features (5-10 minutes)

### Step 1: Clone Repository
```bash
git clone <repo-url>
cd magicwork-main
```

### Step 2: Install Dependencies
```bash
npm install
```

If you get permission errors, try:
```bash
npm install --legacy-peer-deps
```

### Step 3: Configure Environment Variables

Create `.env.local` file in project root:

```env
# Image Generation
OPENAI_API_KEY=sk-...

# Optional: Real Unsplash Images
# UNSPLASH_API_KEY=...

# Optional: Audio Generation
# ELEVENLABS_API_KEY=...
# HF_API_KEY=...

# Database (if using local data)
# DATABASE_URL=...
# POSTGRES_URL=...
```

### Step 4: Generate All Assets

```bash
# Generate everything
npm run generate:all

# Or use the interactive initialization script
bash scripts/init-assets.sh
```

**What gets generated:**
- ✅ 9 practice preview images (gradient-based)
- ✅ 27 meditation preview images (gradient-based)
- ✅ 10 achievement badges (AI-generated animals)
- ⏳ ~3 minutes total generation time

### Step 5: Verify Assets

```bash
# Check all assets are in place
bash scripts/verify-assets.sh
```

Expected output: `✨ All verifications passed!`

### Step 6: Start Development Server

```bash
npm run dev
```

Open browser to: **http://localhost:4000**

## 🎯 Individual Asset Generation

If you only need specific assets:

```bash
# Just practice preview images
npm run generate:previews

# Just meditation preview images
npm run generate:meditations

# Just themed meditation images
npm run generate:themed

# Just achievement badges (requires OPENAI_API_KEY)
npm run generate-badges

# Real Unsplash practice images (requires UNSPLASH_API_KEY)
npm run generate:practice-images
```

## 🔧 Advanced Configuration

### Using Badge Generation (Optional)

Achievement badges require OpenAI DALL-E API:

```bash
# 1. Get API key
# Visit: https://platform.openai.com/api-keys
# Create new secret key

# 2. Set environment variable
export OPENAI_API_KEY=sk-...

# 3. Generate badges
npm run generate-badges
```

**Cost:** ~$0.04 per badge (10 badges = ~$0.40)

### Using Real Unsplash Images (Optional)

For high-quality real meditation photos:

```bash
# 1. Get API key
# Visit: https://unsplash.com/oauth/applications
# Create new application

# 2. Set environment variable
export UNSPLASH_API_KEY=...

# 3. Generate images
npm run generate:practice-images
```

**Cost:** Free (with attribution)

### Using Audio/Voice Generation (Optional)

For ambient sounds and narration, configure Hugging Face or ElevenLabs:

```env
# Hugging Face (free tier available)
HF_API_KEY=hf_...

# OR ElevenLabs (premium voices)
ELEVENLABS_API_KEY=sk_...

# OR OpenAI
OPENAI_API_KEY=sk-...
```

These are used by the `/api/generate-ambient` and `/api/generate-voice` endpoints.

## 📂 Project Structure

```
magicwork-main/
├── public/
│   └── assets/
│       ├── practice-previews/        # ✅ 9 images (local generation)
│       ├── meditation-previews/      # ✅ 27 images (local generation)
│       ├── badges/                   # ✅ 10 images (AI-generated)
│       ├── icons/
│       ├── Fonts/
│       └── Illustrations/
├── api/
│   ├── generate-ambient.js           # Audio generation endpoint
│   ├── generate-voice.js             # Voice narration endpoint
│   ├── generate-practice.js          # Meditation script generation
│   ├── generate-video.js             # Video generation
│   ├── generate-preview.js           # Preview image generation
│   └── generate-image.js             # Image generation
├── src/
│   ├── components/                   # React components
│   ├── services/                     # API services
│   └── utils/                        # Utilities
├── scripts/
│   ├── generate-preview-gradients.mjs     # Local gradient generation
│   ├── generate-meditation-previews.mjs   # Local meditation previews
│   ├── generate-themed-meditations.mjs    # Local themed previews
│   ├── generate-badge-images.js           # AI badge generation
│   ├── init-assets.sh                     # Quick setup script
│   └── verify-assets.sh                   # Verification script
├── ASSET_GENERATION.md               # Detailed asset documentation
└── package.json
```

## ✅ Verification Checklist

After setup, verify everything works:

```bash
# ✅ All npm scripts available
npm run generate:all --dry-run

# ✅ All assets generated
bash scripts/verify-assets.sh

# ✅ Dev server starts
npm run dev
# Press Ctrl+C to stop

# ✅ Production build works
npm run build
npm run preview
```

## 🐛 Troubleshooting

### "Port 4000 already in use"
```bash
# Use different port
npm run dev -- --port 5000
```

### "Module not found: sharp"
```bash
npm install sharp
```

### "OPENAI_API_KEY not set"
```bash
# Badge generation is optional - skip if not needed
# Or set the key: export OPENAI_API_KEY=sk-...
```

### "Images not showing in browser"
```bash
# 1. Check files exist
ls public/assets/practice-previews/

# 2. Verify dev server running
npm run dev

# 3. Clear browser cache (Cmd+Shift+Delete)

# 4. Check browser console for errors (F12)
```

### "Asset generation fails silently"
```bash
# Run with verbose output
NODE_DEBUG=* npm run generate:all

# Or check specific script
node scripts/generate-preview-gradients.mjs
```

### "Development server won't start"
```bash
# Kill existing process
lsof -i :4000 | grep node | awk '{print $2}' | xargs kill -9

# Or use different port
npm run dev -- --port 5000
```

## 🚀 Production Deployment

### Build for Production
```bash
# Generate assets first
npm run generate:all

# Build optimized bundle
npm run build

# Test production build locally
npm run preview
```

### Deploy to Vercel

The API endpoints in `/api` are automatically deployed to Vercel.

```bash
# Vercel CLI
vercel --prod

# Or connect GitHub and push
git push origin main
```

### Manual Deployment

```bash
# Build static site
npm run build

# The output is in dist/
# Upload to any static host (Netlify, AWS S3, etc.)
```

## 📊 Asset Generation Performance

| Asset Type | Count | Time | Method | Cost |
|-----------|-------|------|--------|------|
| Practice Previews | 9 | ~15s | Local (Sharp) | Free |
| Meditation Previews | 27 | ~45s | Local (Sharp) | Free |
| Themed Meditations | 27 | ~60s | Local (Sharp) | Free |
| Achievement Badges | 10 | ~2min | AI (DALL-E) | $0.40 |
| **Total** | **73** | **~3min** | | **$0.40** |

## 📖 Documentation

- **Detailed Asset Guide:** [ASSET_GENERATION.md](./ASSET_GENERATION.md)
- **API Documentation:** Check `/api/*.js` files for endpoint details
- **Component Guide:** Check `src/components/` for component documentation

## 🔄 Regular Maintenance

### Weekly
```bash
# Verify nothing is missing
bash scripts/verify-assets.sh
```

### Monthly
```bash
# Regenerate badges with new styles
npm run generate-badges

# Or refresh all local assets
npm run generate:all
```

## 💡 Tips & Tricks

### Speed Up Local Development
```bash
# Skip badge generation if not working on badges
npm run generate:previews && npm run generate:meditations
```

### Generate Specific Assets
```bash
# Single command example
node scripts/generate-preview-gradients.mjs
```

### Watch Mode (Auto-regenerate)
```bash
# Not implemented, but you can manually re-run:
npm run generate:all
```

### Debug Asset Generation
```bash
# Add debug output
DEBUG=* npm run generate:all
```

## 🎓 Learning Resources

- **Vite Documentation:** https://vitejs.dev
- **React Documentation:** https://react.dev
- **Sharp Image Processing:** https://sharp.pixelplumbing.com
- **OpenAI DALL-E:** https://platform.openai.com/docs/guides/images

## 📞 Support

For issues:
1. Check [ASSET_GENERATION.md](./ASSET_GENERATION.md) for detailed documentation
2. Review error messages in console
3. Check environment variables are set correctly
4. Verify API keys have sufficient quota

## 🎉 You're All Set!

```bash
npm run dev
# 🚀 Dev server running on http://localhost:4000
```

Start developing your meditation app!

---

**Version:** 1.0.0  
**Last Updated:** December 30, 2025
