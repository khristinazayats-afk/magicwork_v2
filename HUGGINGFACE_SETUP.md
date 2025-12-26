# Hugging Face API Setup for Ambient Sound Generation

## 🔒 Add Your Token to Vercel (IMPORTANT - Do This Now!)

**Get your token from**: https://huggingface.co/settings/tokens

**Important**: Your token should ONLY be stored in Vercel environment variables, NEVER in code files!

**DO NOT commit this token to code. It must only be in Vercel environment variables.**

### Step-by-Step:

1. **Go to Vercel Dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Select your `magicwork` project

2. **Open Environment Variables**
   - Click **Settings** tab
   - Click **Environment Variables** in left sidebar

3. **Add New Variable**
   - **Key**: `HF_API_KEY`
   - **Value**: `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`
   - **Environments**: Select **Production**, **Preview**, and **Development**
   - Click **Save**

4. **Redeploy**
   - Go to **Deployments** tab
   - Click **⋯** on the latest deployment
   - Click **Redeploy**
   - Or push a new commit to trigger redeployment

## ✅ Verify It's Working

After redeploying, test the ambient sound generation:

1. Go to your site: `https://magicwork-six.vercel.app`
2. Navigate to `/feed` or `/greeting`
3. Check browser console for any errors
4. Ambient sounds should now be AI-generated!

## 🔍 Troubleshooting

**If sounds still don't work:**

1. **Check Vercel Logs**
   - Go to Vercel Dashboard → Your Project → **Functions** tab
   - Click on `api/generate-ambient`
   - Check **Logs** for errors

2. **Common Issues:**
   - Token not set → Check environment variable is named exactly `HF_API_KEY`
   - Model loading → First request may take 20-30 seconds (model needs to load)
   - Rate limits → Free tier has limits, check Hugging Face dashboard

## 📋 Model Information

Currently using: `facebook/musicgen-small`

**Available Models (can switch in code):**
- `facebook/musicgen-small` - Fast, lightweight (current)
- `facebook/musicgen-medium` - Higher quality
- `facebook/musicgen-large` - Best quality (slower)
- `facebook/audiocraft` - Audio generation

To switch models, edit `api/generate-ambient.js` and change the `modelId` variable.

## 🔐 Security Note

**NEVER commit API tokens to git!** This token should only exist in:
- ✅ Vercel environment variables (correct)
- ❌ Code files (NEVER)
- ❌ GitHub repository (NEVER)
- ❌ Public documentation (NEVER)

---

**Last Updated**: Token provided, ready to add to Vercel

