# AI Image Generation Issue Analysis

## 🔍 Issue Summary

The AI image generation API (`/api/generate-preview`) is failing with a **500 Internal Server Error**.

## 🔎 Root Cause

Based on the code analysis in `api/generate-preview.js`, the endpoint requires the `HF_API_KEY` or `HUGGINGFACE_API_KEY` environment variable to be set in Vercel.

**Code Check:**
```javascript
const hfApiKey = process.env.HF_API_KEY || process.env.HUGGINGFACE_API_KEY;
if (!hfApiKey) {
  return res.status(500).json({ 
    error: 'HF_API_KEY not configured',
    message: 'Please set HF_API_KEY in environment variables'
  });
}
```

Since the API is returning a 500 error, this indicates that:
- ✅ The API endpoint is deployed and accessible
- ❌ The `HF_API_KEY` environment variable is **NOT set** in Vercel
- ❌ Or the environment variable is not being loaded properly

## 🛠️ Fix Steps

### Step 1: Add HF_API_KEY to Vercel Environment Variables

1. **Go to Vercel Dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Select your `magicwork` project (or `magicwork-six`)

2. **Open Environment Variables**
   - Click **Settings** tab
   - Click **Environment Variables** in the left sidebar

3. **Add Hugging Face API Key**
   - Click **Add New**
   - **Key**: `HF_API_KEY`
   - **Value**: `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` (as documented in `VERCEL_ENV_SETUP_COMPLETE.md`)
   - **Environments**: Select **Production**, **Preview**, and **Development**
   - Click **Save**

4. **Verify Alternative Key Name (Optional)**
   - Also add `HUGGINGFACE_API_KEY` with the same value if you want to use that name instead
   - The code checks for both `HF_API_KEY` and `HUGGINGFACE_API_KEY`

### Step 2: Redeploy Application

**Important**: Environment variables are only available after redeployment!

1. Go to **Deployments** tab in Vercel Dashboard
2. Click the **⋯** menu on the latest deployment
3. Select **Redeploy**
4. Or push a new commit to trigger automatic redeployment

### Step 3: Verify Fix

After redeploying, test the API:

```bash
curl -X POST https://magicwork-six.vercel.app/api/generate-preview \
  -H "Content-Type: application/json" \
  -d '{
    "emotionalState": "calm",
    "intent": "focus",
    "spaceName": "Test Space"
  }'
```

**Expected Success Response (200):**
```json
{
  "imageUrl": "data:image/png;base64,...",
  "provider": "huggingface",
  "model": "stabilityai/stable-diffusion-xl-base-1.0",
  "prompt": "minimalist, serene, guided meditation preview artwork, calm mood, focus theme, Test Space atmosphere, soft gradients, gentle light, no text, high aesthetic, editorial quality"
}
```

**Current Error Response (500):**
```json
{
  "error": "HF_API_KEY not configured",
  "message": "Please set HF_API_KEY in environment variables"
}
```

## 📋 Additional Notes

### Related API Endpoints

The same issue may affect other image generation endpoints:
- `/api/generate-image` - Also uses `HF_API_KEY` with fallback to `OPENAI_API_KEY`
- `/api/generate-video` - Uses `OPENAI_API_KEY` (DALL-E 3 for images, Replicate for video)

### Fallback Configuration

The `/api/generate-image` endpoint has a fallback to OpenAI:
- Primary: Hugging Face (`HF_API_KEY`)
- Fallback: OpenAI (`OPENAI_API_KEY`)

However, `/api/generate-preview` **only** uses Hugging Face and does not have a fallback.

### Documentation References

- `VERCEL_ENV_SETUP_COMPLETE.md` - Contains the HF_API_KEY token
- `HUGGINGFACE_SETUP.md` - Setup instructions for Hugging Face
- `api/generate-preview.js` - The actual API implementation

## ✅ Verification Checklist

- [ ] `HF_API_KEY` is set in Vercel Environment Variables
- [ ] Environment variable is enabled for Production, Preview, and Development
- [ ] Application has been redeployed after adding the variable
- [ ] API endpoint `/api/generate-preview` returns 200 status code
- [ ] Response includes `imageUrl` with base64 encoded image
- [ ] Image generation works in the frontend when starting a practice

## 🔄 Testing in Frontend

After fixing, test in the application:
1. Navigate to a practice space (e.g., `/feed` or `/greeting`)
2. Select an emotional state and intent
3. Start a practice
4. Check browser console for: `[Generation] ✓ Preview image generated`
5. Verify the preview image appears in the UI
