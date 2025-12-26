# Hugging Face Full Integration - All AI Generation

## 🎯 Unified AI Platform

All AI generation now uses **Hugging Face Inference API** with a single API key!

## ✅ What's Integrated

### 1. **Ambient Sounds** (`/api/generate-ambient`)
- Model: `facebook/musicgen-small`
- Generates: Ambient meditation soundscapes
- Status: ✅ Already integrated

### 2. **Images** (`/api/generate-image`)
- Model: `stabilityai/stable-diffusion-xl-base-1.0`
- Generates: Meditation background images
- Format: PNG (1024x1024)
- Status: ✅ Updated to Hugging Face

### 3. **Videos** (`/api/generate-video`)
- Model: `stabilityai/stable-diffusion-xl-base-1.0` (for now, generates cinematic frames)
- Generates: Meditation video backgrounds
- Format: PNG frames (1024x1792 vertical)
- Status: ✅ Updated (note: true video generation models may require additional setup)
- Note: Currently returns high-quality static frames that can be looped. True video generation models are evolving.

### 4. **Voice/TTS** (`/api/generate-voice`)
- Model: `microsoft/speecht5_tts`
- Generates: Meditation script narration
- Format: WAV audio
- Status: ✅ Updated to Hugging Face

### 5. **Practice Scripts** (`/api/generate-practice`)
- Model: `meta-llama/Meta-Llama-3.1-8B-Instruct`
- Generates: Personalized meditation scripts
- Status: ✅ Updated to Hugging Face

## 🔑 Single API Key

**One token for everything:**
- Variable: `HF_API_KEY` or `HUGGINGFACE_API_KEY`
- Get your token: https://huggingface.co/settings/tokens
- Add to Vercel: Settings → Environment Variables

## 📋 Model Alternatives

You can easily switch models by editing the `modelId` in each file:

### Images:
- `stabilityai/stable-diffusion-xl-base-1.0` (current - best quality)
- `runwayml/stable-diffusion-v1-5` (faster)
- `black-forest-labs/FLUX.1-dev` (latest, may require premium)

### Text/LLM:
- `meta-llama/Meta-Llama-3.1-8B-Instruct` (current - fast, high quality)
- `mistralai/Mistral-7B-Instruct-v0.2` (alternative)
- `meta-llama/Meta-Llama-3.1-70B-Instruct` (higher quality, slower)

### TTS:
- `microsoft/speecht5_tts` (current)
- `espnet/kan-bayashi_ljspeech_vits` (alternative)

### Audio/Music:
- `facebook/musicgen-small` (current - fast)
- `facebook/musicgen-medium` (higher quality)
- `facebook/musicgen-large` (best quality)

## ⚠️ Important Notes

### Model Loading
- First request to each model may take 20-30 seconds (model needs to load)
- Subsequent requests are faster
- The API returns 503 during loading with `estimated_time`

### Rate Limits
- Free tier has usage limits
- Check your Hugging Face dashboard for usage
- Upgrade to paid tier for higher limits

### Response Formats
- Different models return data in different formats
- The code handles common formats, but may need adjustment for specific models
- Check model documentation on Hugging Face for exact formats

## 🚀 Benefits

1. **One API Key** - Simplify management
2. **Large Model Library** - Access to cutting-edge models
3. **Cost Effective** - Pay-per-use, free tier available
4. **Future Proof** - Easy to switch models as new ones are released
5. **Consistent API** - Same interface for all generation types

## 🔧 Customization

To switch models, simply edit the `modelId` variable in each API file:

```javascript
// In api/generate-image.js
const modelId = 'your-preferred-model-id';
```

Check Hugging Face Model Hub for available models: https://huggingface.co/models

---

**Status**: ✅ All generation endpoints now use Hugging Face
**API Key**: Add `HF_API_KEY` to Vercel environment variables

