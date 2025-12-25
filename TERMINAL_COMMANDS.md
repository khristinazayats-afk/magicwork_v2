# Terminal Commands - Copy & Paste Ready

## Project Directory
```bash
cd /Users/ksvarychevska/git-practice
```

## Quick Navigation
```bash
# Go to project root
cd /Users/ksvarychevska/git-practice

# Check current directory
pwd

# List files
ls -la
```

## Git Commands

### Check Status
```bash
cd /Users/ksvarychevska/git-practice
git status
```

### Add All Changes
```bash
cd /Users/ksvarychevska/git-practice
git add -A
```

### Commit Changes
```bash
cd /Users/ksvarychevska/git-practice
git commit -m "Your commit message here"
```

### Push to GitHub/Vercel
```bash
cd /Users/ksvarychevska/git-practice
git push origin main
```

### Full Workflow (Add, Commit, Push)
```bash
cd /Users/ksvarychevska/git-practice
git add -A
git commit -m "Your commit message"
git push origin main
```

## Development Commands

### Start Dev Server
```bash
cd /Users/ksvarychevska/git-practice
npm run dev
```
Server runs on: `http://localhost:4000`

### Build for Production
```bash
cd /Users/ksvarychevska/git-practice
npm run build
```

### Preview Production Build
```bash
cd /Users/ksvarychevska/git-practice
npm run preview
```

## Database Commands

### Test Database Connection
```bash
cd /Users/ksvarychevska/git-practice
NODE_TLS_REJECT_UNAUTHORIZED=0 npm run test-db
```

### View Database Content
```bash
cd /Users/ksvarychevska/git-practice
NODE_TLS_REJECT_UNAUTHORIZED=0 npm run view-db
```

### Add Clouds Video to Slow Morning
```bash
cd /Users/ksvarychevska/git-practice
NODE_TLS_REJECT_UNAUTHORIZED=0 node scripts/add-clouds-to-slow-morning.js
```

## S3 Commands

### Make S3 Bucket Public (requires AWS credentials)
```bash
cd /Users/ksvarychevska/git-practice
npm run make-s3-public
```

### Setup S3 CORS (requires AWS credentials)
```bash
cd /Users/ksvarychevska/git-practice
npm run setup-s3-cors
```

### Test S3 Access
```bash
cd /Users/ksvarychevska/git-practice
npm run test-s3-access
```

### List S3 Files
```bash
cd /Users/ksvarychevska/git-practice
npm run list:s3
```

## Testing Commands

### Test API Endpoint (Local)
```bash
curl "http://localhost:4000/api/content-assets?space=Slow%20Morning"
```

### Test API Endpoint (Production - after deployment)
```bash
curl "https://your-app.vercel.app/api/content-assets?space=Slow%20Morning"
```

### Test S3 Video URL
```bash
curl -I https://magiwork-canva-assets.s3.eu-north-1.amazonaws.com/video/canva/clouds.mp4
```

## Open Browser

### Open Local Dev Server
```bash
open http://localhost:4000
```

### Open in Chrome
```bash
open -a "Google Chrome" http://localhost:4000
```

### Open in Safari
```bash
open -a "Safari" http://localhost:4000
```

## Common Workflows

### Complete Development Workflow
```bash
# 1. Navigate to project
cd /Users/ksvarychevska/git-practice

# 2. Start dev server
npm run dev

# 3. In another terminal, open browser
open http://localhost:4000
```

### Complete Git Workflow
```bash
# 1. Navigate to project
cd /Users/ksvarychevska/git-practice

# 2. Check what changed
git status

# 3. Add all changes
git add -A

# 4. Commit
git commit -m "Your descriptive commit message"

# 5. Push to GitHub (triggers Vercel deployment)
git push origin main
```

### Fix S3 Permissions (if you have AWS credentials)
```bash
cd /Users/ksvarychevska/git-practice
npm run make-s3-public
npm run setup-s3-cors
npm run test-s3-access
```

## Environment Variables Check

### Check if .env file exists
```bash
cd /Users/ksvarychevska/git-practice
ls -la .env
```

### View .env file (be careful - contains secrets)
```bash
cd /Users/ksvarychevska/git-practice
cat .env
```

## Project Structure
```
/Users/ksvarychevska/git-practice/
├── api/                    # API endpoints
│   └── content-assets.js   # Main content API
├── src/                    # React source code
│   └── components/         # React components
├── scripts/                # Utility scripts
│   ├── add-clouds-to-slow-morning.js
│   ├── make-s3-public.js
│   └── setup-s3-cors.js
├── public/                 # Static assets
├── dist/                   # Build output
└── package.json           # Dependencies
```

## Quick Reference

**Project Path:** `/Users/ksvarychevska/git-practice`

**Dev Server:** `http://localhost:4000`

**Git Remote:** `origin/main`

**Deployment:** Auto-deploys to Vercel on push
