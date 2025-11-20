# TinyLink - Vercel 500 Error Troubleshooting

## Issue
Getting **500 Internal Server Error** on Vercel deployment:
```
POST https://tinylink-app-project-r3bq.vercel.app/api/links → 500
```

## Root Causes & Solutions

### 1️⃣ **Missing or Invalid DATABASE_URL**

**Check:**
1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select your project: `tinylink-app-project`
3. Go to **Settings** → **Environment Variables**
4. Verify `DATABASE_URL` is set

**If NOT set:**
- Create PostgreSQL database on Neon: https://neon.tech
- Copy connection string
- Add to Vercel as `DATABASE_URL`
- Redeploy

**If set but wrong format:**
- Should look like:
  ```
  postgresql://user:password@host:port/database?sslmode=require
  ```
- Test locally first:
  ```bash
  DATABASE_URL="your-string" npm start
  ```

### 2️⃣ **Database Connection String Has Spaces/Special Characters**

**Fix:**
- Copy the FULL connection string exactly from Neon
- Don't add extra spaces or quotes
- Include `?sslmode=require` at the end
- Example:
  ```
  postgresql://user:abc123@ep-xyz.region.neon.tech/tinylink?sslmode=require
  ```

### 3️⃣ **Database Not Initialized on Vercel**

Vercel runs in a stateless environment. The database tables might not be created.

**Fix:**
1. Run locally to create tables:
   ```bash
   node db/init.js
   ```
   Should show: `✓ Database initialized successfully`

2. Or create tables manually in Neon:
   ```sql
   CREATE TABLE IF NOT EXISTS links (
     id SERIAL PRIMARY KEY,
     short_code VARCHAR(8) UNIQUE NOT NULL,
     target_url TEXT NOT NULL,
     total_clicks INTEGER DEFAULT 0,
     creation_count INTEGER DEFAULT 1,
     last_clicked TIMESTAMP,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   
   CREATE INDEX IF NOT EXISTS idx_short_code ON links(short_code);
   CREATE INDEX IF NOT EXISTS idx_target_url ON links(target_url);
   ```

### 4️⃣ **Check Vercel Function Logs**

1. Deploy your app on Vercel
2. Go to **Deployments** → Latest deployment
3. Click the deployment to view logs
4. Scroll down to see error details

### 5️⃣ **Test Connection Locally**

Run diagnostics:
```bash
node diagnose.js
```

This will:
- ✓ Test pool connection
- ✓ Execute queries
- ✓ Check table structure
- ✓ Show environment variables
- ✓ Test insert/retrieve

## Step-by-Step Fix

### Step 1: Verify Database
```bash
# Test locally
node diagnose.js

# Should output:
# ✓ Pool created successfully
# ✓ Links table has 8 columns
# ✅ All diagnostics passed!
```

### Step 2: Check Vercel Environment
1. Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Verify:
   - `DATABASE_URL` exists
   - It's not empty
   - It matches your Neon connection string exactly

### Step 3: Redeploy
1. Go to Deployments
2. Click latest deployment
3. Click **Redeploy** button
4. Wait for ✓ completion

### Step 4: Test API
```bash
# Health check
curl https://tinylink-app-project-r3bq.vercel.app/healthz
# Should return: {"ok":true,"version":"1.0"}

# Create link
curl -X POST https://tinylink-app-project-r3bq.vercel.app/api/links \
  -H "Content-Type: application/json" \
  -d '{"target_url":"https://www.google.com"}'
# Should return: 201 with link data, NOT 500
```

## Advanced Debugging

### View Vercel Logs
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# View function logs
vercel logs --tail
```

### Test Database Connection Only
Create `test-db.js`:
```javascript
const pool = require('./db/config');

pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
  console.log('✓ Database connected');
  console.log('Current time:', result.rows[0].now);
  pool.end();
});
```

Run:
```bash
NODE_ENV=production DATABASE_URL="your-url" node test-db.js
```

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `ECONNREFUSED` | Can't reach database | Check DATABASE_URL, Neon is running |
| `password authentication failed` | Wrong password in URL | Verify DATABASE_URL format |
| `database "tinylink" does not exist` | DB not created | Create in Neon dashboard |
| `relation "links" does not exist` | Table not created | Run `node db/init.js` locally first |
| `timeout on connection` | Network issue | Add `?sslmode=require` to URL |

## Environment Variables Checklist

Vercel Settings → Environment Variables should have:

```
DATABASE_URL = postgresql://user:pass@host/db?sslmode=require
NODE_ENV = production (optional)
```

## If Still Stuck

1. Delete and recreate your Neon database
2. Run `node diagnose.js` locally
3. Share output with support
4. Check Vercel Function Logs for exact error
5. Verify DATABASE_URL matches exactly
