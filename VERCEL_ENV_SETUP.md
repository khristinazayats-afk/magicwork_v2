# Vercel Environment Variables Setup

## Critical Issue

The API is returning mock data because the database connection is failing. This is likely because `POSTGRES_URL` is not set in Vercel's environment variables.

## How to Fix

### Step 1: Get Your Supabase Connection String

Your Supabase connection string should look like:
```
postgres://postgres.ejhafhggndirnxmwrtgm:YOUR_PASSWORD@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x
```

You can find it in:
- Supabase Dashboard → Project Settings → Database → Connection String (Pooler mode)
- Or use the non-pooling connection:
```
postgres://postgres.ejhafhggndirnxmwrtgm:YOUR_PASSWORD@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require
```

### Step 2: Set Environment Variable in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`magiwork` or similar)
3. Go to **Settings** → **Environment Variables**
4. Add a new environment variable:
   - **Name**: `POSTGRES_URL`
   - **Value**: Your Supabase connection string (from Step 1)
   - **Environment**: Select **Production**, **Preview**, and **Development** (or at least Production)
5. Click **Save**

### Step 3: Redeploy

After setting the environment variable:
1. Go to **Deployments** tab
2. Click the **⋯** menu on the latest deployment
3. Select **Redeploy**
4. Or push a new commit to trigger a new deployment

### Step 4: Verify

After redeploying, test the API:

```bash
curl "https://magiwork.vercel.app/api/content-assets?space=Drift%20into%20Sleep"
```

**Expected Result** (with database working):
- CDN URLs like `https://d3hajr7xji31qq.cloudfront.net/...`
- Real data from your Supabase database

**If Still Getting Mock Data**:
- Check Vercel Function Logs for error messages
- Verify `POSTGRES_URL` is set correctly
- Make sure you redeployed after setting the variable

## Alternative: Check Vercel Function Logs

1. Go to Vercel Dashboard → Your Project
2. Click on **Functions** tab
3. Click on `api/content-assets`
4. Check the **Logs** tab for error messages

Look for messages like:
- `❌ POSTGRES_URL environment variable is not set!`
- `Database query failed: ...`
- Connection errors

## Troubleshooting

### Error: "POSTGRES_URL is not set"
- Solution: Set the environment variable in Vercel (see Step 2)

### Error: "Connection refused" or "ECONNREFUSED"
- Solution: Check your Supabase connection string is correct
- Make sure you're using the pooler connection (port 6543) not direct connection (port 5432)

### Error: "SSL required" or "sslmode required"
- Solution: Make sure your connection string includes `?sslmode=require`

### Still Getting Mock Data
- Check that you redeployed after setting the environment variable
- Environment variables are only available after redeployment
- Check Vercel logs to see the actual error

## Quick Test

To test if the database connection works locally:

```bash
npm run test-db
```

If this works locally but not in Vercel, it's definitely an environment variable issue.


