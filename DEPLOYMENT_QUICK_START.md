# 🚀 Quick Deployment Guide

## Step 1: Run Database Migrations (Required)

**Go to Supabase SQL Editor:**
1. https://supabase.com/dashboard/project/pujvtikwdmxlfrqfsjpu
2. Click **SQL Editor**
3. Run `database/migrations/create_practice_cards_table.sql`
4. Run `database/migrations/create_usage_tracking_table.sql`

## Step 2: Deploy to Vercel

### Option A: Git Push (Easiest)
```bash
git add .
git commit -m "Add card features: preview, timer, tracking, completion messages"
git push
```
Vercel auto-deploys on push! ✅

### Option B: Vercel CLI
```bash
# Login (use your token: $VERCEL_TOKEN)
vercel login

# Link project
vercel link

# Deploy
vercel --prod
```

### Option C: Vercel Dashboard
1. Go to Vercel Dashboard
2. Select project: `prj_dndWKafuHj6qtj6VAFQveIuDaTNq`
3. Click **Deploy** (or it auto-deploys on Git push)

## ✅ That's It!

Your deployment will:
- ✅ Connect to Supabase automatically
- ✅ Use existing environment variables
- ✅ Deploy all new features
- ✅ Start tracking usage immediately

## 🧪 Test After Deployment

1. Open your deployed site
2. Click a practice card
3. Select timer duration
4. Select voice audio
5. Start practice
6. Verify countdown timer
7. Complete practice
8. See custom completion message

## 📊 Verify Database

Check Supabase Dashboard → Table Editor:
- `practice_cards` - Should have 36 rows
- `practice_sessions` - Will grow as users practice
- `active_sessions` - Shows live user counts

## 🎉 Done!

Everything is ready. Just run migrations and deploy! 🚀

