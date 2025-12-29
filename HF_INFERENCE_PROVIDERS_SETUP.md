# ✅ Hugging Face Inference Providers Setup (PERFECT FOR YOU!)

## What You Get with HF Pro

Your HF Pro subscription ($9/month) includes:
- **20× inference credits** for Inference Providers
- **Pay-per-use serverless inference** (only charges when you actually generate content)
- Access to 100+ providers (Groq, Together, Sambanova, Novita, etc.)
- Models: Llama 3.1, Qwen, DeepSeek, FLUX.1 for images, and more

## Why This is Perfect

✅ **Only pay when you use it** (not 24/7 like dedicated endpoints)
✅ **Pro subscription gives you 20× credits** (way more than free tier)
✅ **Automatic provider selection** (picks fastest/cheapest automatically)
✅ **OpenAI-compatible API** (easy to integrate)

## Setup Steps

### Step 1: Create Token with Inference Providers Permission

1. Go to: https://huggingface.co/settings/tokens/new?ownUserPermissions=inference.serverless.write&tokenType=fineGrained

2. Settings:
   - **Token type**: Fine-grained
   - **Token name**: "Inference Providers - Magicwork"
   - **Permissions**: ✅ Make calls to Inference Providers
   - **Expiration**: Never

3. Click "Create token"

4. Copy the new token (starts with `hf_...`)

### Step 2: Add Token to Vercel

```bash
cd /Users/leightonbingham/Downloads/magicwork-main
echo "YOUR_NEW_TOKEN" | vercel env add HF_API_KEY production
echo "YOUR_NEW_TOKEN" | vercel env add HF_API_KEY preview  
echo "YOUR_NEW_TOKEN" | vercel env add HF_API_KEY development
```

### Step 3: Update API Endpoints

All endpoints now use: `https://router.huggingface.co/v1/chat/completions`

**Practice Script Generation** - uses Llama 3.1-8B:
- Pricing: $0.02-0.05 per 1M input tokens, $0.05-0.09 per 1M output tokens
- Provider auto-selected (uses `:cheapest` suffix)

**Image Generation** - we'll switch to FLUX.1-dev:
- Pricing: ~$0.001-0.01 per image
- Provider: fal-ai or replicate (fastest)

**Voice/TTS** - use OpenAI (HF doesn't have good TTS via Inference Providers):
- Pricing: $15 per 1M characters (~$0.015 per 1000 chars)

**Ambient Music** - keep CDN fallback (no API needed)

## Model Selection

### Text Generation (Practice Scripts)
```javascript
const modelId = 'meta-llama/Llama-3.1-8B-Instruct:cheapest';
// Alternatives: 
// - openai/gpt-oss-120b:fastest (bigger model)
// - deepseek-ai/DeepSeek-V3.2:cheapest (cheaper)
```

### Image Generation  
```javascript
const modelId = 'black-forest-labs/FLUX.1-dev';
// Provider: fal-ai (fastest) or replicate
```

## API Format (OpenAI-Compatible)

```javascript
const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${HF_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'meta-llama/Llama-3.1-8B-Instruct:cheapest',
    messages: [
      { role: 'system', content: 'You are a meditation teacher.' },
      { role: 'user', content: 'Create a 2-minute meditation script.' }
    ],
    max_tokens: 500,
    temperature: 0.7
  })
});

const data = await response.json();
const content = data.choices[0].message.content;
```

## Pricing Estimate

For your meditation app with **moderate usage** (100 practice generations/day):

**Practice Scripts:**
- 100 generations/day × ~500 tokens output = 50,000 tokens/day
- 50,000 tokens × 30 days = 1.5M tokens/month
- Cost: 1.5M × $0.09/1M = **$0.14/month**

**Images:**
- 50 images/day × $0.005 = $0.25/day
- $0.25 × 30 = **$7.50/month**

**Total:** ~$8/month (well within HF Pro credits!)

## Advantages Over Alternatives

### vs OpenAI
- ✅ Cheaper (5-10× less expensive)
- ✅ Open models (Llama, Qwen)
- ✅ More provider options
- ❌ Slightly slower

### vs Groq
- ✅ Pay-per-use (Groq has daily limits)
- ✅ Image generation included
- ✅ More model variety
- ❌ Groq is faster for text

### vs Dedicated HF Endpoints  
- ✅ Only pay when used (not 24/7)
- ✅ No infrastructure management
- ✅ Auto-scaling
- ❌ Cold starts possible (first request slower)

## Next Steps

1. Generate new token: https://huggingface.co/settings/tokens/new?ownUserPermissions=inference.serverless.write&tokenType=fineGrained

2. Tell me the token and I'll:
   - Add it to Vercel
   - Update all API endpoints
   - Test practice + image generation
   - Deploy to production

Ready? Share the new token!
