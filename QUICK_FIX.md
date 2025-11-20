# TinyLink - Quick Fix for Vercel 500 Error

## Problem
Getting **500 Internal Server Error** when calling API on Vercel:
```
POST https://tinylink-app-project-ie95.vercel.app/api/links
```

## Root Cause
✗ `DATABASE_URL` environment variable is not set in Vercel
✗ Database connection defaults to `localhost` which doesn't exist on Vercel

## Solution (5 Minutes)

### 1️⃣ Create Free PostgreSQL Database (Neon)
- Go to https://neon.tech
- Sign up with GitHub
- Create new project
- Copy Connection String (example):
  ```
  postgresql://user:pass@ep-xxx.region.neon.tech/tinylink_db?sslmode=require
  ```

### 2️⃣ Add to Vercel
1. Open https://vercel.com/dashboard
2. Click **tinylink-app-project**
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter:
   - **Name:** `DATABASE_URL`
   - **Value:** Paste your Neon connection string
6. Click **Save**

### 3️⃣ Redeploy
1. Go to **Deployments**
2. Click latest deployment
3. Click **Redeploy**
4. Wait for ✓ completion

### 4️⃣ Test API
```bash
curl https://tinylink-app-project-ie95.vercel.app/api/links
```
Should return: `[]` (empty array)

## Expected Results

✓ Health Check
```
GET /healthz → {"ok":true,"version":"1.0"}
```

✓ Create Link
```
POST /api/links
{
  "target_url": "https://www.google.com"
}
→ 201 Created
```

✓ List Links
```
GET /api/links → [...]
```

✓ Redirect
```
GET /{shortcode} → 302 Redirect
```

## Files Updated
- `db/config.js` - Better error handling & logging
- `VERCEL_DEPLOYMENT.md` - Full deployment guide
- `.env.example` - Reference for env variables

## Support
If still getting error:
1. Check Vercel Environment Variables are saved
2. Look at Vercel Function Logs: Settings → Function Logs
3. Verify Neon database is active
4. Ensure DATABASE_URL format is correct
