# OpenAI API Setup Guide

## ✅ API Endpoints Created

Three new API endpoints have been created:

1. **`/api/generate-practice`** - Generates meditation practice content
2. **`/api/generate-image`** - Generates images using DALL-E 3
3. **`/api/generate-video`** - Placeholder (video generation not yet available)

## 🔑 Setting Up Your OpenAI API Key

### Step 1: Add API Key to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`magiwork` or similar)
3. Go to **Settings** → **Environment Variables**
4. Add a new environment variable:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: `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`
   - **Environment**: Select **Production**, **Preview**, and **Development**
5. Click **Save**

### Step 2: Redeploy

After setting the environment variable:

1. Go to **Deployments** tab
2. Click the **⋯** menu on the latest deployment
3. Select **Redeploy**
4. Or push a new commit to trigger a new deployment

⚠️ **Important**: Environment variables are only available after redeployment!

---

## 📋 API Endpoint Details

### 1. Generate Practice Content

**Endpoint**: `POST /api/generate-practice`

**Request Body**:
```json
{
  "emotionalState": "anxious",  // or "calm", "neutral", "slightly_anxious", "very_anxious"
  "durationMinutes": 10         // positive number
}
```

**Response**:
```json
{
  "content": "Generated meditation script...",
  "emotionalState": "anxious",
  "durationMinutes": 10,
  "wordsPerMinute": 120,
  "estimatedWords": 1200
}
```

**Features**:
- Adjusts pacing based on emotional state (anxious = 120 words/min, calm = 60 words/min)
- Generates structured meditation scripts
- Uses GPT-4o-mini for cost efficiency

---

### 2. Generate Image

**Endpoint**: `POST /api/generate-image`

**Request Body**:
```json
{
  "prompt": "a peaceful meditation space with soft lighting"
}
```

**Response**:
```json
{
  "imageUrl": "https://oaidalleapiprodscus.blob.core.windows.net/...",
  "prompt": "enhanced prompt",
  "revisedPrompt": "OpenAI's revised version of your prompt"
}
```

**Features**:
- Uses DALL-E 3
- Automatically enhances prompts with meditation context
- Generates 1024x1024 images

---

### 3. Generate Video

**Endpoint**: `POST /api/generate-video`

**Status**: ⚠️ **Not yet available**

OpenAI doesn't currently support video generation. This endpoint returns a helpful error message with suggestions for alternatives (RunwayML, Pika Labs, etc.).

When OpenAI releases video generation, this endpoint will be updated.

---

## 🧪 Testing the Endpoints

### Test Practice Generation

```bash
curl -X POST https://magiwork.vercel.app/api/generate-practice \
  -H "Content-Type: application/json" \
  -d '{
    "emotionalState": "anxious",
    "durationMinutes": 10
  }'
```

### Test Image Generation

```bash
curl -X POST https://magiwork.vercel.app/api/generate-image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "peaceful meditation garden"
  }'
```

### Expected Errors

If you get errors like:
- `"OpenAI API key not configured"` → API key not set in Vercel
- `"Method not allowed"` → Using GET instead of POST
- `401 Unauthorized` → Invalid API key

---

## 💰 Cost Considerations

### GPT-4o-mini (Practice Generation)
- Very cost-effective
- ~$0.15 per 1M input tokens
- ~$0.60 per 1M output tokens
- Typical practice generation: ~$0.01-0.02 per request

### DALL-E 3 (Image Generation)
- $0.040 per image (1024x1024, standard quality)
- $0.080 per image (1024x1024, HD quality)
- Images are generated once and can be cached

### Recommendations
- Cache generated content when possible
- Consider rate limiting for production
- Monitor usage in OpenAI dashboard

---

## 🔒 Security Notes

1. **Never commit API keys to git**
   - The API key should only be in Vercel environment variables
   - If committed by accident, regenerate the key in OpenAI dashboard

2. **Use different keys for production/staging**
   - Create separate API keys for different environments
   - Set different environment variables in Vercel

3. **Monitor usage**
   - Set up usage alerts in OpenAI dashboard
   - Monitor spending limits

---

## 📝 Next Steps

1. ✅ API endpoints created
2. ⏳ Set `OPENAI_API_KEY` in Vercel (use the key provided above)
3. ⏳ Redeploy the application
4. ⏳ Test the endpoints
5. ⏳ Update client code to use the endpoints (already done in Flutter services)

---

## 🐛 Troubleshooting

### "OpenAI API key not configured"
- Check Vercel environment variables
- Make sure you redeployed after setting the variable
- Verify the variable name is exactly `OPENAI_API_KEY`

### "401 Unauthorized"
- Check the API key is correct
- Verify the key hasn't been revoked
- Check OpenAI dashboard for key status

### "Rate limit exceeded"
- Check OpenAI usage limits
- Consider upgrading your OpenAI plan
- Implement rate limiting in your app

---

*All three AI agent backend endpoints are now ready!*









