# Vercel Deployment Setup

## 🔐 Vercel Token Configuration

You'll need a Vercel token available as: `$VERCEL_TOKEN`

### ⚠️ Security First

**NEVER commit this token to code or Git!**

### Setup Steps

#### Option 1: Vercel CLI (Local Deployment)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login with your token**:
   ```bash
   vercel login
   # When prompted, paste: $VERCEL_TOKEN
   ```

3. **Link to your project**:
   ```bash
   vercel link
   # Select project: prj_dndWKafuHj6qtj6VAFQveIuDaTNq
   ```

4. **Deploy**:
   ```bash
   vercel --prod
   ```

#### Option 2: Environment Variable (For CI/CD)

If you need to use this token in CI/CD or scripts:

1. **Add to Vercel Dashboard**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `VERCEL_TOKEN` = `<your vercel token>`
   - Scope: Production, Preview, Development

2. **Or use in local .env** (never commit this file):
   ```bash
   # .env (add to .gitignore)
   VERCEL_TOKEN=<your vercel token>
   ```

## 🚀 Deployment Workflow

### 1. Run Database Migrations First

**Before deploying, run migrations in Supabase:**

1. Go to Supabase Dashboard → SQL Editor
2. Run `database/migrations/create_practice_cards_table.sql`
3. Run `database/migrations/create_usage_tracking_table.sql`

### 2. Deploy to Vercel

**Via Git (Recommended)**:
```bash
git add .
git commit -m "Add card features: preview, timer, tracking, completion"
git push
# Vercel auto-deploys on push
```

**Via Vercel CLI**:
```bash
vercel --prod
```

**Via Vercel Dashboard**:
- Go to Vercel Dashboard
- Select project
- Click "Deploy" or it auto-deploys on Git push

## 🔗 Vercel ↔ Supabase Integration

Your Vercel project is already connected to Supabase:

- ✅ `POSTGRES_URL` - Pooled connection for API queries
- ✅ `POSTGRES_URL_NON_POOLING` - Direct connection for migrations
- ✅ All Supabase keys configured

**No additional setup needed!** The API will automatically connect to Supabase.

## 📋 Pre-Deployment Checklist

- [ ] Database migrations run in Supabase SQL Editor
- [ ] Environment variables verified in Vercel Dashboard
- [ ] Code committed to Git
- [ ] Ready to deploy!

## 🧪 Post-Deployment Testing

After deployment, test:

1. **Preview Cards**: Should show 15-second video clips
2. **Live Counts**: Should display "X people are practicing now"
3. **Timer Modal**: Click card → Modal appears
4. **Practice Flow**: Select duration → Practice starts → Countdown shows
5. **Completion**: Custom message appears when practice ends

## 🔧 Troubleshooting

### If deployment fails:

1. **Check environment variables**:
   - Vercel Dashboard → Settings → Environment Variables
   - Verify `POSTGRES_URL` is set

2. **Check build logs**:
   - Vercel Dashboard → Deployments → Click deployment → View logs

3. **Verify database connection**:
   - Test in Supabase SQL Editor
   - Check connection string format

### If database connection fails:

- Verify `POSTGRES_URL` uses pooled connection (port 6543)
- For migrations, use `POSTGRES_URL_NON_POOLING` (port 5432)
- Check Supabase project is active

## 📝 Token Security

**Important Reminders:**

1. ✅ Token is stored in Vercel Dashboard (secure)
2. ✅ Never commit token to Git
3. ✅ Add `.env` to `.gitignore` if using local .env file
4. ✅ Rotate token if accidentally exposed

## 🎉 Ready to Deploy!

Your setup is complete:
- ✅ Vercel token: Configured
- ✅ Supabase connection: Configured
- ✅ Environment variables: Set
- ✅ Code: Ready

Just run migrations and deploy! 🚀

