# Quick Start: Connect S3 to Vercel

## Required Environment Variables

Add these 4 environment variables in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `AWS_ACCESS_KEY_ID` | Your AWS Access Key | Get from AWS IAM |
| `AWS_SECRET_ACCESS_KEY` | Your AWS Secret Key | Get from AWS IAM |
| `AWS_REGION` | `eu-north-1` | Your S3 bucket region |
| `S3_BUCKET` | `magicwork-canva-assets` | Your bucket name |

## Steps

1. **Get AWS Credentials**
   - AWS Console → IAM → Users → Create/Select User
   - Security Credentials → Create Access Key
   - Save both Access Key ID and Secret Access Key

2. **Set in Vercel**
   - Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all 4 variables above
   - ✅ Enable for Production, Preview, Development
   - Click Save

3. **Redeploy**
   - Deployments → Latest → ⋯ → Redeploy
   - Or push a commit: `git commit --allow-empty -m "Add S3 env vars" && git push`

4. **Verify**
   - Check Vercel logs for errors
   - Test video/audio loading in your app

## Full Guide

See `VERCEL_S3_SETUP.md` for detailed instructions, troubleshooting, and security best practices.
