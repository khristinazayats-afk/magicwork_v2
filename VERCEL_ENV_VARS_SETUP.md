# Vercel Environment Variables Setup Guide

## 🎯 Goal

Set the following environment variables in Vercel project `ez0dEUFF55Q6LzzC2Uf30Zpe`:

- `ELEVENLABS_API_KEY` = `sk_654d070bd8fe7043b341bbc4d0b1b35cbe75eb2e8930bdf8`
- `HIGGSFIELD_API_KEY_ID` = `a04c96c9-c475-4c8e-870f-750389b1180f`
- `HIGGSFIELD_API_KEY_SECRET` = `48f7adf01dc11f69df3cf21d3e2f8b3c53b760ccd732b0e24bb5ddc5fc563580`

## 🚀 Quick Setup (Automated Script)

### Option 1: Using Shell Script (Recommended)

1. **Get your Vercel token**:
   - Go to: https://vercel.com/account/tokens
   - Click "Create Token"
   - Copy the token

2. **Run the script**:
   ```bash
   cd /Users/ksvarychevska/magicwork/mw_v2/magicwork-v2
   VERCEL_TOKEN=your_token_here ./scripts/add-vercel-env-vars.sh
   ```

   Or export it first:
   ```bash
   export VERCEL_TOKEN=your_token_here
   ./scripts/add-vercel-env-vars.sh
   ```

### Option 2: Using Node.js Script

1. **Get your Vercel token** (same as above)

2. **Run the script**:
   ```bash
   cd /Users/ksvarychevska/magicwork/mw_v2/magicwork-v2
   VERCEL_TOKEN=your_token_here node scripts/set-vercel-env.js
   ```

   Or pass as argument:
   ```bash
   node scripts/set-vercel-env.js your_token_here
   ```

## 🔧 Manual Setup (Vercel Dashboard)

If you prefer to use the Vercel Dashboard:

1. **Go to Vercel Dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Select your project (ID: `ez0dEUFF55Q6LzzC2Uf30Zpe`)

2. **Open Environment Variables**
   - Click **Settings** tab
   - Click **Environment Variables** in the left sidebar

3. **Add Each Variable**:
   
   **ELEVENLABS_API_KEY:**
   - Click **Add New**
   - **Key**: `ELEVENLABS_API_KEY`
   - **Value**: `sk_654d070bd8fe7043b341bbc4d0b1b35cbe75eb2e8930bdf8`
   - **Environments**: Select **Production**, **Preview**, and **Development**
   - Click **Save**

   **HIGGSFIELD_API_KEY_ID:**
   - Click **Add New**
   - **Key**: `HIGGSFIELD_API_KEY_ID`
   - **Value**: `a04c96c9-c475-4c8e-870f-750389b1180f`
   - **Environments**: Select **Production**, **Preview**, and **Development**
   - Click **Save**

   **HIGGSFIELD_API_KEY_SECRET:**
   - Click **Add New**
   - **Key**: `HIGGSFIELD_API_KEY_SECRET`
   - **Value**: `48f7adf01dc11f69df3cf21d3e2f8b3c53b760ccd732b0e24bb5ddc5fc563580`
   - **Environments**: Select **Production**, **Preview**, and **Development**
   - Click **Save**

4. **Redeploy**
   - Go to **Deployments** tab
   - Click **⋯** on the latest deployment
   - Click **Redeploy**

## 🔧 Manual Setup (Vercel CLI)

If you have Vercel CLI authenticated:

```bash
cd /Users/ksvarychevska/magicwork/mw_v2/magicwork-v2

# Link to project
npx vercel link --project ez0dEUFF55Q6LzzC2Uf30Zpe --yes

# Add ELEVENLABS_API_KEY
echo "sk_654d070bd8fe7043b341bbc4d0b1b35cbe75eb2e8930bdf8" | npx vercel env add ELEVENLABS_API_KEY production
echo "sk_654d070bd8fe7043b341bbc4d0b1b35cbe75eb2e8930bdf8" | npx vercel env add ELEVENLABS_API_KEY preview
echo "sk_654d070bd8fe7043b341bbc4d0b1b35cbe75eb2e8930bdf8" | npx vercel env add ELEVENLABS_API_KEY development

# Add HIGGSFIELD_API_KEY_ID
echo "a04c96c9-c475-4c8e-870f-750389b1180f" | npx vercel env add HIGGSFIELD_API_KEY_ID production
echo "a04c96c9-c475-4c8e-870f-750389b1180f" | npx vercel env add HIGGSFIELD_API_KEY_ID preview
echo "a04c96c9-c475-4c8e-870f-750389b1180f" | npx vercel env add HIGGSFIELD_API_KEY_ID development

# Add HIGGSFIELD_API_KEY_SECRET
echo "48f7adf01dc11f69df3cf21d3e2f8b3c53b760ccd732b0e24bb5ddc5fc563580" | npx vercel env add HIGGSFIELD_API_KEY_SECRET production
echo "48f7adf01dc11f69df3cf21d3e2f8b3c53b760ccd732b0e24bb5ddc5fc563580" | npx vercel env add HIGGSFIELD_API_KEY_SECRET preview
echo "48f7adf01dc11f69df3cf21d3e2f8b3c53b760ccd732b0e24bb5ddc5fc563580" | npx vercel env add HIGGSFIELD_API_KEY_SECRET development
```

## ✅ Verification

After setting the variables, verify they're set:

1. **Check in Vercel Dashboard**:
   - Go to: Settings → Environment Variables
   - Verify all three variables are listed

2. **Check via CLI** (if authenticated):
   ```bash
   npx vercel env ls
   ```

3. **Redeploy** to apply changes:
   - Vercel Dashboard → Deployments → Redeploy
   - Or trigger a new deployment by pushing a commit

## 📝 Notes

- **Environment variables only take effect after redeployment**
- Variables are encrypted in Vercel
- Each variable is set for Production, Preview, and Development environments
- The project ID is: `ez0dEUFF55Q6LzzC2Uf30Zpe`

## 🔍 Troubleshooting

**If the script fails with "token not valid":**
- Verify your token at: https://vercel.com/account/tokens
- Make sure the token hasn't expired
- Create a new token if needed

**If variables don't appear after setting:**
- Make sure you redeployed the project
- Check that you set them for the correct environments
- Verify the project ID is correct

**If CLI commands fail:**
- Make sure you're in the correct directory
- Ensure `vercel` package is installed (`npm install vercel --save-dev`)
- Try logging in first: `npx vercel login`
