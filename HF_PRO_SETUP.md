# Hugging Face Pro API Setup Guide

## Current Situation (December 2024)

Hugging Face has deprecated their free Inference API (`api-inference.huggingface.co`). Even with a Pro subscription, you need to use **Dedicated Inference Endpoints** rather than the shared inference API.

## HF Pro Subscription Options

### 1. Dedicated Inference Endpoints (Recommended for Pro Users)

**What it is:**
- Your own private model deployment
- Pay per hour of compute time
- Guaranteed uptime and performance
- Auto-scaling options

**Setup Steps:**
1. Go to https://ui.endpoints.huggingface.co/
2. Click "Create new endpoint"
3. Select your model (e.g., `mistralai/Mistral-7B-Instruct-v0.2`)
4. Choose instance type:
   - **CPU**: $0.06/hour (slower, text-only)
   - **GPU (small)**: $0.60/hour (fast, works for all models)
   - **GPU (medium)**: $1.30/hour (very fast, large models)
5. Deploy and get your endpoint URL: `https://YOUR_ENDPOINT.us-east-1.aws.endpoints.huggingface.cloud`

**Update Code:**
```javascript
// Instead of:
const url = `https://api-inference.huggingface.co/models/${modelId}`;

// Use your dedicated endpoint:
const url = `https://YOUR_ENDPOINT_ID.us-east-1.aws.endpoints.huggingface.cloud`;
```

### 2. Serverless Inference (Coming Soon)

Hugging Face is rolling out serverless inference for Pro users, but it's not fully available yet.

## Alternative: Use Free/Low-Cost APIs

Since dedicated endpoints cost $0.60/hour minimum, consider these alternatives:

### OpenAI (Most Reliable)
- Practice scripts: GPT-4o-mini ($0.15/$0.60 per 1M tokens)
- Images: DALL-E 3 ($0.04 per image)
- Voice: OpenAI TTS ($15 per 1M characters)

**Monthly cost:** ~$5-10 for moderate usage

### Groq (Free Tier)
- Models: Llama 3.1, Mixtral
- Limit: 14,400 requests/day (FREE)
- Speed: Extremely fast (2x faster than OpenAI)
- Only text generation (no images/audio)

**Setup:**
```bash
# Get free API key: https://console.groq.com
vercel env add GROQ_API_KEY
```

### Together AI (Low Cost)
- Models: Llama 3.1, SDXL, more
- Price: $0.20 per 1M tokens (text), $0.01 per image
- First $5 free credit

## Recommendation

For your meditation app with occasional AI generation:

**Best Option: Groq (Free) + OpenAI (Images/Voice)**
```bash
# Add both keys
vercel env add GROQ_API_KEY         # For practice scripts (free)
vercel env add OPENAI_API_KEY       # For images/voice ($5-10/mo)
```

**Update Code Priority:**
1. Practice generation → Groq (fastest, free)
2. Image generation → OpenAI DALL-E 3 (reliable, $0.04/image)
3. Voice → OpenAI TTS (best quality, $0.015 per 1000 chars)
4. Music → Keep CDN fallback (no API needed)

This gives you free practice generation with Groq, and pay-per-use for images/voice with OpenAI.

## Next Steps

Tell me which option you prefer:
1. **Groq + OpenAI** (free text, cheap images/voice)
2. **Full OpenAI** (all-in-one, reliable, ~$10/mo)
3. **HF Dedicated Endpoint** (setup your own endpoint, I'll help configure)
