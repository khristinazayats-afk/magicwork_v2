# Vercel Environment Variables Setup - Summary

## ✅ What's Been Set Up

1. **Vercel CLI Installed**: Vercel CLI (v50.1.6) is now installed as a dev dependency
2. **Automated Scripts Created**:
   - `scripts/add-vercel-env-vars.sh` - Shell script to set environment variables
   - `scripts/set-vercel-env.js` - Node.js script using REST API directly
3. **Documentation Created**: `VERCEL_ENV_VARS_SETUP.md` with complete instructions

## 🎯 Variables to Set

These environment variables need to be added to Vercel project `ez0dEUFF55Q6LzzC2Uf30Zpe`:

- `ELEVENLABS_API_KEY` = `sk_654d070bd8fe7043b341bbc4d0b1b35cbe75eb2e8930bdf8`
- `HIGGSFIELD_API_KEY_ID` = `a04c96c9-c475-4c8e-870f-750389b1180f`
- `HIGGSFIELD_API_KEY_SECRET` = `48f7adf01dc11f69df3cf21d3e2f8b3c53b760ccd732b0e24bb5ddc5fc563580`

## 🚀 Quick Start (Recommended)

### Step 1: Get Your Vercel Token

1. Go to: https://vercel.com/account/tokens
2. Click "Create Token"
3. Name it: "Magicwork Setup"
4. Copy the token (it will look like `vercel_xxxxx...`)

### Step 2: Run the Script

**Option A: Using Shell Script (Easiest)**
```bash
cd /Users/ksvarychevska/magicwork/mw_v2/magicwork-v2
VERCEL_TOKEN=your_token_here ./scripts/add-vercel-env-vars.sh
```

**Option B: Using Node.js Script (More Flexible)**
```bash
cd /Users/ksvarychevska/magicwork/mw_v2/magicwork-v2
VERCEL_TOKEN=your_token_here node scripts/set-vercel-env.js
```

**Option C: Export Token First (Cleaner)**
```bash
cd /Users/ksvarychevska/magicwork/mw_v2/magicwork-v2
export VERCEL_TOKEN=your_token_here
./scripts/add-vercel-env-vars.sh
```

### Step 3: Verify and Redeploy

1. **Verify in Dashboard**:
   - Go to: https://vercel.com/dashboard
   - Select your project (ID: `ez0dEUFF55Q6LzzC2Uf30Zpe`)
   - Go to: Settings → Environment Variables
   - Verify all three variables are listed for Production, Preview, and Development

2. **Redeploy** (Important!):
   - Go to: Deployments tab
   - Click **⋯** on the latest deployment
   - Click **Redeploy**
   - Or push a commit to trigger automatic redeployment

## 📋 Alternative: Manual Setup via Dashboard

If the scripts don't work, you can manually add the variables:

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add each variable:
   - Key: `ELEVENLABS_API_KEY`, Value: `sk_654d070bd8fe7043b341bbc4d0b1b35cbe75eb2e8930bdf8`
   - Key: `HIGGSFIELD_API_KEY_ID`, Value: `a04c96c9-c475-4c8e-870f-750389b1180f`
   - Key: `HIGGSFIELD_API_KEY_SECRET`, Value: `48f7adf01dc11f69df3cf21d3e2f8b3c53b760ccd732b0e24bb5ddc5fc563580`
5. Enable for: Production, Preview, Development
6. Redeploy

## 🔍 Troubleshooting

**If scripts fail with "token not valid":**
- Verify token at: https://vercel.com/account/tokens
- Make sure token hasn't expired
- Create a new token if needed

**If "project not found":**
- Verify project ID: `ez0dEUFF55Q6LzzC2Uf30Zpe`
- Make sure your token has access to this project
- Try using the dashboard instead

**If variables don't work after setting:**
- **MUST redeploy** after setting environment variables
- Variables only take effect after redeployment
- Check Vercel Function Logs for errors

## 📚 Full Documentation

See `VERCEL_ENV_VARS_SETUP.md` for complete instructions and all available options.
