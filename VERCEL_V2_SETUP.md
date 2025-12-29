# Vercel V2 Deployment Setup Guide

This guide will help you create a separate Vercel deployment for the V2 components (new design).

## Option A: Create New Project via Vercel Dashboard (Recommended)

### Step 1: Create New Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository (same repo: `magicwork-main`)
4. Give it a new project name: `magicwork-v2` or `magicwork-new-design`

### Step 2: Configure Project Settings

**Framework Preset:** Vite  
**Root Directory:** `./` (leave as is)  
**Build Command:** `npm run build`  
**Output Directory:** `dist`  
**Install Command:** `npm install`

### Step 3: Copy Environment Variables

You need to copy all environment variables from your existing Vercel project:

1. Go to your **existing project** (`magicwork-six`) → **Settings** → **Environment Variables**
2. Copy all the variables listed below
3. Go to your **new project** (`magicwork-v2`) → **Settings** → **Environment Variables**
4. Add each variable for **Production**, **Preview**, and **Development** environments

**Required Environment Variables:**
- `POSTGRES_URL`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `S3_BUCKET`
- `CDN_BASE_URL` (optional)
- `HF_API_KEY` (optional)
- `OPENAI_API_KEY` (optional)
- Any other environment variables from your original project

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for the deployment to complete
3. Your new V2 site will be available at: `https://magicwork-v2.vercel.app` (or your chosen name)

### Step 5: Access V2 Routes

Once deployed, you can access the new design at:
- Landing: `https://magicwork-v2.vercel.app/landing-v2`
- Login: `https://magicwork-v2.vercel.app/login-v2`
- Feed: `https://magicwork-v2.vercel.app/feed-v2`
- Dashboard: `https://magicwork-v2.vercel.app/dashboard-v2`

---

## Option B: Use Vercel CLI

If you have Vercel CLI installed, you can create a new project from the command line:

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Link to a new project (in the project directory)
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account/team)
# - Link to existing project? No
# - What's your project's name? magicwork-v2
# - In which directory is your code located? ./
# - Want to override the settings? No (or Yes if you want to customize)

# Add environment variables
vercel env add POSTGRES_URL production
vercel env add AWS_ACCESS_KEY_ID production
vercel env add AWS_SECRET_ACCESS_KEY production
# ... (add all other required variables)

# Deploy to production
vercel --prod
```

---

## Option C: Use Different Branch (Alternative Approach)

If you want to keep deployments separate by branch:

1. Create a new branch: `v2-design`
2. Push it to GitHub
3. In Vercel Dashboard → Your existing project → Settings → Git
4. Configure to deploy `v2-design` branch to a different production domain
5. Or create a new Vercel project that only deploys from the `v2-design` branch

---

## Recommended: Option A (Dashboard)

**Option A is the easiest and most straightforward.** It gives you:
- ✅ Separate deployment URL
- ✅ Independent deployment history
- ✅ Same codebase, different deployments
- ✅ Easy to compare old vs new design side-by-side

---

## Next Steps After Deployment

1. Test all V2 routes work correctly
2. Share the new URL with the owner for review
3. Once approved, you can either:
   - Keep both deployments (old and new)
   - Switch the main domain to the new design
   - Remove the old deployment

---

## Notes

- Both deployments use the same codebase and environment variables
- Changes to `main` branch will deploy to both projects (if both are connected)
- You can configure which branches deploy to which project in Vercel settings
- The V2 components don't affect the original routes (`/feed`, `/login`, etc.)

