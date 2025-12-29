# Vercel Environment Variables - Complete Setup Guide

## 🔑 Required API Keys

### Primary (Recommended)
- **`HF_API_KEY`** - Hugging Face API token for all AI generation
  - Get token: https://huggingface.co/settings/tokens
  - Your token: `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`
  - Used for: Images, Videos, Voice, Practice Scripts, Ambient Sounds

### Fallback (Optional but Recommended)
- **`OPENAI_API_KEY`** - OpenAI API key (backup if Hugging Face unavailable)
  - Get key: https://platform.openai.com/api-keys
  - Used as fallback for: Images, Videos, Voice, Practice Scripts

## ✅ How to Add to Vercel

1. **Go to Vercel Dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Select your `magicwork` project

2. **Open Environment Variables**
   - Click **Settings** tab
   - Click **Environment Variables** in left sidebar

3. **Add Hugging Face Token (Primary)**
   - Click **Add New**
   - **Key**: `HF_API_KEY`
   - **Value**: `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`
   - **Environments**: Select **Production**, **Preview**, and **Development**
   - Click **Save**

4. **Add OpenAI Key (Fallback - Optional)**
   - Click **Add New** again
   - **Key**: `OPENAI_API_KEY`
   - **Value**: `your-openai-api-key-here`
   - **Environments**: Select **Production**, **Preview**, and **Development**
   - Click **Save**

5. **Redeploy**
   - Go to **Deployments** tab
   - Click **⋯** on the latest deployment
   - Click **Redeploy**
   - Or push a new commit to trigger redeployment

## 📋 Complete Environment Variables Checklist

### Critical (Required)
- [ ] `POSTGRES_URL` - Supabase database connection
- [ ] `AWS_ACCESS_KEY_ID` - AWS S3 access
- [ ] `AWS_SECRET_ACCESS_KEY` - AWS S3 secret
- [ ] `AWS_REGION` - S3 bucket region
- [ ] `S3_BUCKET` - S3 bucket name

### AI Generation (Recommended)
- [ ] `HF_API_KEY` - Hugging Face token (primary for all AI generation)
- [ ] `OPENAI_API_KEY` - OpenAI key (fallback, optional but recommended)

### Optional
- [ ] `CDN_BASE_URL` - CloudFront CDN URL
- [ ] Other optional variables as needed

## 🔄 How It Works

The system uses a **primary/fallback** pattern:

1. **Hugging Face (Primary)**
   - If `HF_API_KEY` is set, all AI generation uses Hugging Face
   - Models: Stable Diffusion (images), MusicGen (audio), Llama (text), SpeechT5 (voice)

2. **OpenAI (Fallback)**
   - If `HF_API_KEY` is not set but `OPENAI_API_KEY` is available
   - Falls back to: DALL-E (images), GPT (text), TTS (voice)

3. **Error Handling**
   - If neither key is set, returns helpful error message
   - If Hugging Face fails and OpenAI is available, can fallback (implementation dependent)

## ⚠️ Important Notes

- **Never commit API keys to code** - Always use Vercel environment variables
- **Redeploy after adding variables** - Changes only take effect after redeployment
- **Check logs** - If something doesn't work, check Vercel Function Logs

## 🧪 Testing

After adding keys and redeploying:

1. Test image generation: Check if images generate properly
2. Test practice scripts: Try generating a meditation practice
3. Test ambient sounds: Check if sounds play
4. Check Vercel Logs: Monitor for any errors

---

**Status**: Ready to configure
**Next Step**: Add `HF_API_KEY` and optionally `OPENAI_API_KEY` to Vercel



