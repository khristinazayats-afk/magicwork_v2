# MagicWork Asset Generation System

Complete guide for generating all images, sounds, videos, and guidance content for the meditation platform.

## Quick Start

```bash
# Generate all assets at once
npm run generate:all

# Or use the initialization script
bash scripts/init-assets.sh
```

## Individual Generation Commands

### Generate Practice Preview Images (9 images)
```bash
npm run generate:previews
```
Creates gradient-based preview images for each practice space:
- Slow Morning
- Gentle De-Stress
- Take a Walk
- Draw Your Feels
- Move and Cool
- Tap to Ground
- Breathe to Relax
- Get in the Flow State
- Drift into Sleep

**Output:** `public/assets/practice-previews/*.jpg`

### Generate Meditation Preview Images (27 images)
```bash
npm run generate:meditations
```
Creates preview images for each meditation (3 per practice space):
- 9 practice spaces × 3 meditations = 27 total images

**Output:** `public/assets/meditation-previews/*.jpg`

### Generate Themed Meditation Images (27 images)
```bash
npm run generate:themed
```
Creates high-quality themed meditation images with AI-style gradients and overlays.

**Output:** `public/assets/meditation-previews/*.jpg` (overlays previous generation)

### Generate Achievement Badges (10 images)
```bash
npm run generate-badges
```
Creates unique animal-themed achievement badges using OpenAI DALL-E:
- Sleepy Otter
- Unbothered Tortoise
- Calm Polar Bear
- Chilled Capybara
- Serene Quokka
- Resourceful Owl
- Resilient Deer
- Cool Koala
- Zenned Panda
- Collected Alpaca

**Output:** `public/assets/badges/*.png`

**Requirements:** `OPENAI_API_KEY` environment variable must be set

### Generate Practice Images from Unsplash (9 images) - Optional
```bash
npm run generate:practice-images
```
Downloads real meditation images from Unsplash and optimizes them.

**Output:** `public/assets/practice-previews/*.jpg` (overlays gradient generation)

**Requirements:** `UNSPLASH_API_KEY` environment variable must be set

## API Endpoints for Dynamic Content Generation

### Generate Ambient Sounds
```bash
POST /api/generate-ambient
```
Generates meditation ambient soundscapes (rain, waves, forest birds, white noise, etc.)

**Requirements:** `HF_API_KEY` or `ELEVENLABS_API_KEY` environment variable

### Generate Voice Narration
```bash
POST /api/generate-voice
```
Generates voice-over narration for meditation scripts with various narrator voices.

**Requirements:** `ELEVENLABS_API_KEY` (preferred) or `OPENAI_API_KEY`

### Generate Practice Scripts
```bash
POST /api/generate-practice
```
Generates personalized meditation scripts based on emotional state, duration, and intent.

**Requirements:** `HF_API_KEY` environment variable

### Generate Practice Videos
```bash
POST /api/generate-video
```
Generates short meditation background videos with movement and transitions.

**Requirements:** Various video generation APIs

### Generate Preview Images
```bash
POST /api/generate-preview
```
Generates preview images on-demand for specific meditations.

## Environment Variables Setup

Create a `.env.local` file in the project root with:

```env
# Image Generation
OPENAI_API_KEY=sk-...
UNSPLASH_API_KEY=...

# Audio Generation
ELEVENLABS_API_KEY=...
HF_API_KEY=...  # Hugging Face Inference API
HUGGINGFACE_API_KEY=...

# Database
DATABASE_URL=...
POSTGRES_URL=...

# AWS S3 (optional - for uploading to CDN)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=...
```

## Asset Storage Structure

```
public/
├── assets/
│   ├── practice-previews/          # 9 practice preview images
│   ├── meditation-previews/        # 27 meditation preview images
│   ├── badges/                     # 10 achievement badges
│   ├── videos/                     # Meditation background videos
│   ├── audio/                      # Ambient sounds & narration
│   ├── icons/                      # UI icons and graphics
│   ├── Illustrations/              # Additional artwork
│   └── Fonts/                      # Custom typography
```

## Asset Generation Details

### Images (Local Generation - No API Required)

#### Practice Preview Gradients
- **Format:** JPG (800×1000px)
- **Method:** Sharp image processing with SVG gradients
- **Time:** ~1-2 seconds per image
- **Total:** 9 images
- **Dependencies:** `sharp` package

#### Meditation Preview Images
- **Format:** JPG (800×320px)
- **Method:** Gradient-based with decorative overlays
- **Time:** ~1-2 seconds per image
- **Total:** 27 images
- **Dependencies:** `sharp` package

#### Themed Meditation Images
- **Format:** JPG (1200×630px)
- **Method:** AI-enhanced gradients with pattern overlays
- **Time:** ~2-3 seconds per image
- **Total:** 27 images
- **Dependencies:** `sharp` package

### Images (API-Based Generation)

#### Achievement Badges
- **Provider:** OpenAI DALL-E
- **Format:** PNG with transparency
- **Method:** AI image generation with animal themes
- **Time:** ~10-15 seconds per image (with rate limiting)
- **Total:** 10 images
- **Cost:** ~$0.04 per image
- **Dependencies:** `openai` package, OpenAI API key

### Audio (API-Based Generation)

#### Ambient Sounds
- **Provider:** Hugging Face Inference (facebook/musicgen-small)
- **Format:** WAV or MP3
- **Duration:** 10 seconds (loopable)
- **Generation Time:** 15-30 seconds on first call
- **Dependencies:** HF_API_KEY

#### Voice Narration
- **Primary Provider:** ElevenLabs (high-quality meditation voices)
- **Fallback:** OpenAI TTS
- **Format:** MP3
- **Generation Time:** 2-5 seconds per request
- **Dependencies:** ELEVENLABS_API_KEY or OPENAI_API_KEY

### Video (API-Based Generation)

#### Meditation Background Videos
- **Format:** MP4
- **Duration:** 5-30 minutes
- **Resolution:** 1080p
- **Method:** Generated with canvas/Manim or video APIs
- **Dependencies:** Various video generation services

## Troubleshooting

### "UNSPLASH_API_KEY not set" Error
**Solution:** Skip `npm run generate:practice-images` if not needed, or set up Unsplash API key

```bash
# Get free API key at: https://unsplash.com/oauth/applications
export UNSPLASH_API_KEY=your_key_here
```

### "OPENAI_API_KEY not set" Error
**Solution:** Badge generation requires OpenAI API key

```bash
# Get API key at: https://platform.openai.com/api-keys
export OPENAI_API_KEY=sk-...
npm run generate-badges
```

### "Model is loading" Error for Audio/Voice
**Solution:** Hugging Face models load on first request. Try again in 20-30 seconds.

### Images Not Appearing in Dev Server
**Solution:** Ensure Vite dev server is running with:

```bash
npm run dev
```

The dev server proxies `/api` calls to Vercel and serves `/public/assets` correctly.

## Performance Optimization

### Local Generation (Recommended)
- Practice previews: 9 images, ~15 seconds total
- Meditation previews: 27 images, ~45 seconds total
- Themed meditations: 27 images, ~60 seconds total
- **Total local generation: ~2 minutes**

### API-Based Generation
- Badges: 10 images, ~2 minutes (with rate limiting)
- Ambient sounds: On-demand, 15-30 seconds first call
- Voice narration: On-demand, 2-5 seconds per request
- **Total API generation: Varies by demand**

## CI/CD Integration

Add to your deployment pipeline:

```yaml
# vercel.json or similar
{
  "buildCommand": "npm run build && npm run generate:all"
}
```

Or create a post-build hook to auto-generate missing assets.

## Manual Asset Upload to S3 (Optional)

```bash
# Sync all generated assets to S3
npm run upload:s3

# List current S3 assets
npm run list:s3

# Make all S3 assets public
npm run make-s3-public
```

## Monitoring Asset Generation

Check asset counts:

```bash
# Count all generated images
find public/assets -type f \( -name "*.jpg" -o -name "*.png" \) | wc -l

# Check for missing assets
ls public/assets/practice-previews/   # Should have 9 items
ls public/assets/meditation-previews/ # Should have 27 items
ls public/assets/badges/              # Should have 10 items
```

## Future Enhancements

- [ ] Batch video generation
- [ ] AI-driven custom meditation backgrounds
- [ ] Dynamic color palette generation
- [ ] Real-time asset optimization
- [ ] Asset CDN integration
- [ ] Automated daily background refresh
- [ ] Multi-language narration support

## Support

For issues or questions:
1. Check `.env.local` environment variables
2. Verify API keys are valid and have sufficient quota
3. Check console logs for specific error messages
4. Review API provider documentation

---

**Last Updated:** December 30, 2025
**Version:** 1.0.0
