# PostgreSQL Setup Guide for TinyLink

## Prerequisites

- PostgreSQL installed on your machine
- Node.js v14+ installed

## Windows Setup

### 1. Install PostgreSQL

1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer
3. Note your password for the `postgres` user (remember this!)
4. Default port is `5432`
5. Default username is `postgres`

### 2. Create Database

Open PowerShell and run:

```powershell
# Connect to PostgreSQL as postgres user
psql -U postgres

# Create database
CREATE DATABASE tinylink_db;

# Exit
\q
```

Or use one command:
```powershell
createdb -U postgres tinylink_db
```

### 3. Configure .env

Edit `.env` file in the project root:

```env
DATABASE_URL=postgresql://postgres@localhost:5432/tinylink_db
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000
```

**Important**: 
- Replace `postgres` with your username if different
- If you set a password, use: `postgresql://postgres:password@localhost:5432/tinylink_db`
- The `localhost` is the server address
- `5432` is the default PostgreSQL port

### 4. Install Dependencies

```powershell
cd c:\Sunil\tinylink-app
npm install
```

This will install:
- express
- pg (PostgreSQL client)
- dotenv (environment variables)
- cors

### 5. Start the Server

```powershell
npm start
```

You should see:
```
✓ Database initialized successfully
╔════════════════════════════════════════╗
║   TinyLink - URL Shortener Started     ║
║   Server running at:                   ║
║   http://localhost:3000                ║
╚════════════════════════════════════════╝
```

### 6. Test the Application

Open browser:
- Dashboard: http://localhost:3000
- Health: http://localhost:3000/healthz

## Troubleshooting

### "could not connect to server: No such file or directory"

PostgreSQL is not running. Start it:

**Windows (Service)**:
- Open Services (services.msc)
- Find "postgresql-x64-15" (or similar)
- Click "Start" if stopped

**Or via Command Line**:
```powershell
net start postgresql-x64-15
```

### "role postgres does not exist"

Create the role:
```sql
psql -U postgres
CREATE ROLE postgres WITH CREATEDB LOGIN PASSWORD 'password';
```

### "database tinylink_db does not exist"

Create it:
```powershell
psql -U postgres -c "CREATE DATABASE tinylink_db;"
```

### Connection refused error

Check if PostgreSQL is running:
```powershell
netstat -ano | findstr :5432
```

If nothing appears, start PostgreSQL.

### "Module not found" errors

```powershell
npm install
# or
npm install --force
```

## Database Schema

The application automatically creates the `links` table:

```sql
CREATE TABLE links (
  id SERIAL PRIMARY KEY,
  short_code VARCHAR(8) UNIQUE NOT NULL,
  target_url TEXT NOT NULL,
  total_clicks INTEGER DEFAULT 0,
  last_clicked TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_short_code ON links(short_code);
```

## Common Tasks

### View all links in database

```powershell
psql -U postgres -d tinylink_db -c "SELECT * FROM links;"
```

### Delete all links

```powershell
psql -U postgres -d tinylink_db -c "DELETE FROM links;"
```

### Reset auto-increment

```powershell
psql -U postgres -d tinylink_db -c "ALTER SEQUENCE links_id_seq RESTART WITH 1;"
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | postgresql://postgres@localhost:5432/tinylink_db |
| PORT | Server port | 3000 |
| NODE_ENV | Environment | development or production |
| BASE_URL | Base URL for redirects | http://localhost:3000 |

## Deployment

When deploying to production:

1. Use a managed PostgreSQL service (Neon, Railway, Heroku Postgres)
2. Update DATABASE_URL in environment variables
3. Set NODE_ENV=production
4. Use HTTPS for BASE_URL

### Free PostgreSQL Hosting:
- Neon: https://neon.tech (free tier available)
- Railway: https://railway.app (free tier available)
- Heroku Postgres: https://www.heroku.com/postgres

## Next Steps

1. Verify database is created
2. Configure .env with correct credentials
3. Run: `npm install`
4. Run: `npm start`
5. Open http://localhost:3000
6. Create your first short link!
