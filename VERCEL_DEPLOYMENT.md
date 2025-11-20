# Vercel Deployment Guide - TinyLink

## Issue
Getting 500 Internal Server Error on deployed API because DATABASE_URL is not configured in Vercel.

## Solution - Set up PostgreSQL on Neon (Free Tier)

### Step 1: Create Neon Account
1. Go to https://neon.tech
2. Sign up with GitHub (recommended)
3. Create a new project

### Step 2: Create Database
1. Click "Create new project"
2. Name: `tinylink-db`
3. Region: Choose closest to you
4. Click "Create project"

### Step 3: Get Connection String
1. In Neon dashboard, go to your project
2. Click "Connection String"
3. Select "Connection string" (not Psycopg2)
4. Copy the full connection string (looks like):
   ```
   postgresql://neon_user:password@ep-xxx.region.neon.tech/tinylink_db?sslmode=require
   ```

### Step 4: Add to Vercel
1. Go to your Vercel project: https://vercel.com/dashboard
2. Click your "tinylink-app-project"
3. Go to "Settings" → "Environment Variables"
4. Add new variable:
   - **Name:** `DATABASE_URL`
   - **Value:** Paste the Neon connection string from Step 3
   - Click "Save"

### Step 5: Redeploy
1. Go to "Deployments"
2. Click the latest deployment
3. Click "Redeploy" button
4. Wait for deployment to complete

### Step 6: Test
Visit your API:
```
https://tinylink-app-project-ie95.vercel.app/api/links
```

Should now return: `[]` (empty array) instead of 500 error

## Alternative: PostgreSQL Providers

**Neon (Recommended - Free)**
- https://neon.tech
- 3 GB storage free tier

**Railway**
- https://railway.app
- Free tier with credits

**Render**
- https://render.com
- Free PostgreSQL database

## Testing After Deployment

### Health Check
```
GET https://tinylink-app-project-ie95.vercel.app/healthz
```
Response: `{"ok":true,"version":"1.0"}`

### Create Link
```
POST https://tinylink-app-project-ie95.vercel.app/api/links
Content-Type: application/json

{
  "target_url": "https://www.google.com"
}
```

### List Links
```
GET https://tinylink-app-project-ie95.vercel.app/api/links
```

### Visit Link (Redirect)
```
GET https://tinylink-app-project-ie95.vercel.app/{shortcode}
```
Should redirect with 302 status

## Troubleshooting

**Still getting 500 error?**
1. Check Environment Variables are saved in Vercel
2. Verify DATABASE_URL format is correct
3. Check Vercel Logs: Settings → Function Logs
4. Make sure Neon database is active

**Connection timeout?**
- Add `?sslmode=require` to connection string
- Make sure Neon IP whitelist includes Vercel (usually auto)

**Database not created?**
- Vercel will auto-create tables on first request via `db/init.js`
- Check Neon dashboard to confirm database exists
