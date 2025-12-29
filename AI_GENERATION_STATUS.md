# AI Content Generation Status

## Current Situation

**Hugging Face API Changes (Dec 2024)**
- Old endpoint: `api-inference.huggingface.co` → **DEPRECATED**
- New endpoint: `router.huggingface.co` → Requires paid serverless subscriptions
- Free tier inference API is no longer available for most models

## Recommended Solutions

### Option 1: OpenAI API (Immediate, Reliable)
Use OpenAI for all AI generation:
- **Practice Scripts**: GPT-4o-mini ($0.15/M input, $0.60/M output)
- **Images**: DALL-E 3 ($0.04 per image)
- **Voice/TTS**: OpenAI TTS ($15/M characters)
- **Music**: Use CDN fallback (already implemented)

**Cost estimate**: ~$5-10/month for moderate usage

### Option 2: Groq (Fast & Free LLM)
- Free tier: 30 req/min, 14,400 req/day
- Models: Llama 3.1, Mixtral, Gemma
- Only for text/practice generation
- Still need OpenAI for images/voice

### Option 3: Replicate (Pay-per-use)
- Text: Llama 3.1 ($0.05/M tokens)
- Images: SDXL ($0.001 per image)
- Music: MusicGen ($0.005 per second)
- Voice: Various TTS models

## Video Generation Note

**"True video generation models coming soon"** means:

The current `/api/generate-video` endpoint generates **static images** (1024x1792 cinematic frames) using Stable Diffusion XL, not actual video files.

**Why?**
- True text-to-video models (like Runway Gen-2, Stability Video Diffusion) are:
  - Expensive ($0.05-0.10 per second)
  - Slow (30-60 seconds generation time)
  - Require specialized APIs

**Current approach:**
- Generate high-quality vertical images
- Animate client-side with CSS/parallax effects
- Much faster and cheaper
- Adequate for meditation backgrounds

**True video alternatives:**
- **Replicate**: Stable Video Diffusion (~$0.05/sec)
- **Runway ML**: Gen-2 (~$0.05/sec)
- **Leonardo.ai**: Motion (~$0.03/frame)

## Immediate Action Items

1. **Add OpenAI API key** to Vercel:
   ```bash
   vercel env add OPENAI_API_KEY
   ```

2. **Update endpoints** to use OpenAI as primary (HF fallback removed)

3. **Test generation flow**:
   - Practice scripts with GPT-4o-mini
   - Images with DALL-E 3  
   - Voice with OpenAI TTS
   - Music uses CDN fallback (no API needed)

## Files That Need Updating

- `api/generate-practice.js` - Switch to OpenAI chat completions
- `api/generate-image.js` - Already has OpenAI fallback
- `api/generate-voice.js` - Add OpenAI TTS
- `api/generate-ambient.js` - Keep CDN fallback (no API)
- `api/generate-video.js` - Keep current image-based approach

## Alternative: Use Existing HF Token with Paid Plans

If you want to use Hugging Face:
- **Pro Plan**: $9/month (includes inference for most models)
- **Enterprise**: $20/month (unlimited inference)

Then switch back to `router.huggingface.co` endpoints.
