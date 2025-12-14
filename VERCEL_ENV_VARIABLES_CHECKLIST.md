# Vercel Environment Variables Checklist

This document lists **all** environment variables that should be configured in Vercel for your application to work properly.

## 🔴 Critical (Required for Production)

These variables are **essential** and the app will not work without them:

| Variable | Description | Where Used | Example Value |
|----------|-------------|------------|---------------|
| `POSTGRES_URL` | Supabase PostgreSQL connection string | Database queries, API endpoints | `postgres://postgres.xxx:password@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require` |
| `AWS_ACCESS_KEY_ID` | AWS Access Key for S3 access | S3 file operations, scripts | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Key for S3 access | S3 file operations, scripts | `xxx...` |
| `AWS_REGION` | AWS region where S3 bucket is located | S3 client configuration | `eu-north-1` |
| `S3_BUCKET` | S3 bucket name for content assets | S3 operations, URL generation | `magicwork-canva-assets` |

## 🟡 Important (Recommended)

These variables improve functionality but have defaults:

| Variable | Description | Default Value | Where Used |
|----------|-------------|---------------|------------|
| `CDN_BASE_URL` | CloudFront CDN URL for assets | `https://magicwork-canva-assets.s3.eu-north-1.amazonaws.com` | Asset URL generation |
| `CDN_BASE` | Alternative CDN URL variable | Same as CDN_BASE_URL | Asset URL generation |
| `CDN_DOMAIN` | CDN domain name | `cdn.magicwork.app` | Asset URL generation |

## 🟢 Optional (Development/Advanced Features)

These variables are only needed for specific features:

| Variable | Description | Where Used | Required For |
|----------|-------------|------------|--------------|
| `POSTGRES_URL_NON_POOLING` | Non-pooling database connection | Database scripts | Local development scripts |
| `CANVA_API_KEY` | Canva API key for content export | `scripts/export-canva-to-s3.js` | Canva integration |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution ID | CloudFront invalidation | CDN cache invalidation |
| `GOOGLE_SHEET_ID` | Google Sheets ID for CMS sync | `scripts/sync-content-cms.js` | Google Sheets CMS |
| `GOOGLE_SHEET_NAME` | Google Sheets tab name | `scripts/sync-content-cms.js` | Google Sheets CMS |
| `GOOGLE_SHEET_PUBLIC` | Whether sheet is public | `scripts/sync-content-cms.js` | Google Sheets CMS |
| `OPENAI_API_KEY` | OpenAI API key | `scripts/generate-badge-images.js` | Badge image generation |
| `EXPORT_API_URL` | Export API endpoint URL | `scripts/sync-content-cms.js` | Content export |
| `NODE_ENV` | Node environment | Various | Auto-set by Vercel |

## 📋 Quick Setup Checklist

### Step 1: Database Connection
- [ ] `POSTGRES_URL` - Set to your Supabase connection string
  - Format: `postgres://postgres.xxx:password@host:6543/postgres?sslmode=require`
  - Get from: Supabase Dashboard → Settings → Database → Connection String (Pooler)

### Step 2: AWS S3 Configuration
- [ ] `AWS_ACCESS_KEY_ID` - Your AWS Access Key
- [ ] `AWS_SECRET_ACCESS_KEY` - Your AWS Secret Key
- [ ] `AWS_REGION` - Set to `eu-north-1` (or your bucket region)
- [ ] `S3_BUCKET` - Set to `magicwork-canva-assets`

### Step 3: CDN Configuration (Optional but Recommended)
- [ ] `CDN_BASE_URL` - Your CloudFront CDN URL (if using CloudFront)
  - Example: `https://d3hajr7xji31qq.cloudfront.net`
  - Or leave unset to use S3 direct URLs

### Step 4: Verify Environment
- [ ] All variables enabled for **Production** environment
- [ ] All variables enabled for **Preview** environment (optional)
- [ ] All variables enabled for **Development** environment (optional)

## 🔍 How to Check Current Variables in Vercel

1. **Go to Vercel Dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Select your project

2. **Open Environment Variables**
   - Click **Settings** tab
   - Click **Environment Variables** in left sidebar

3. **Review Your Variables**
   - Check each variable from the checklist above
   - Verify they're enabled for the correct environments
   - Check that values are correct (not empty, correct format)

## 🧪 Testing Your Configuration

After setting variables, test them:

### Test Database Connection
```bash
# In Vercel Function Logs, check for:
# ✅ "Database connection successful"
# ❌ "POSTGRES_URL environment variable is not set!"
```

### Test S3 Access
```bash
# Check if videos/audio load in your app
# Look for CORS errors or 403 errors in browser console
```

### Test API Endpoint
```bash
curl "https://your-app.vercel.app/api/content-assets?space=Drift%20into%20Sleep"
# Should return JSON with CDN URLs, not mock data
```

## 📝 Current Status Check

Based on your codebase, here's what should be set:

### ✅ Already Configured (Based on Previous Setup)
- `POSTGRES_URL` - You mentioned this is set

### ⚠️ Needs Configuration (Based on S3 Setup)
- `AWS_ACCESS_KEY_ID` - **Needs to be set**
- `AWS_SECRET_ACCESS_KEY` - **Needs to be set**
- `AWS_REGION` - **Needs to be set** (should be `eu-north-1`)
- `S3_BUCKET` - **Needs to be set** (should be `magicwork-canva-assets`)

### 🔵 Optional (Can be added later)
- `CDN_BASE_URL` - For CloudFront CDN (optional)
- Other optional variables as needed

## 🚨 Common Issues

### Issue: Variables Not Working After Setting
**Solution:**
- Variables only take effect after redeployment
- Go to Deployments → Latest → ⋯ → Redeploy
- Or push a new commit

### Issue: Variables Set But Still Getting Errors
**Solution:**
- Check variable names are exact (case-sensitive)
- Verify variables are enabled for Production environment
- Check Vercel Function Logs for specific error messages

### Issue: Database Connection Failing
**Solution:**
- Verify `POSTGRES_URL` includes `?sslmode=require`
- Use pooler connection (port 6543) not direct (port 5432)
- Check Supabase dashboard for correct connection string

### Issue: S3 Access Denied
**Solution:**
- Verify AWS credentials have S3 read permissions
- Check S3 bucket is public or bucket policy allows access
- Verify CORS is configured on S3 bucket

## 📚 Related Documentation

- **Database Setup**: See `VERCEL_ENV_SETUP.md`
- **S3 Setup**: See `VERCEL_S3_SETUP.md`
- **Quick S3 Reference**: See `VERCEL_S3_QUICK_START.md`

## 🔄 Next Steps

1. ✅ Review this checklist
2. ✅ Go to Vercel Dashboard → Settings → Environment Variables
3. ✅ Add any missing variables from the Critical section
4. ✅ Verify all Critical variables are set correctly
5. ✅ Redeploy your application
6. ✅ Test your application to verify everything works

---

**Last Updated**: Based on codebase analysis of all `process.env` usage
