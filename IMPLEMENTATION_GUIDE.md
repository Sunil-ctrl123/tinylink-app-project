# TinyLink Implementation Guide

## Project Overview

TinyLink is a URL shortener application built with Node.js + Express that allows users to create short, memorable links, track click statistics, and manage links through a clean web interface.

## Requirements Met ✅

### Core Features
- ✅ **Create Short Links**: Users can create short links with auto-generated or custom 6-8 character codes
- ✅ **URL Validation**: URLs must be valid with http:// or https://
- ✅ **Global Uniqueness**: Custom codes are globally unique; duplicate codes return 409 Conflict
- ✅ **Redirect with Click Tracking**: Visiting /:code performs 302 redirect and increments click count
- ✅ **Click Statistics**: Each link tracks total clicks and last clicked timestamp
- ✅ **Delete Links**: Users can delete links; after deletion /:code returns 404
- ✅ **Dashboard**: Main page shows all links with table view, search, and filter
- ✅ **Stats Page**: /code/:code displays detailed statistics for a single link
- ✅ **Health Check**: /healthz endpoint returns 200 with status information

### API Endpoints (Spec Compliant)

| Method | Path | Description | Status Codes |
|--------|------|-------------|-------------|
| POST | /api/links | Create link | 201, 400, 409 |
| GET | /api/links | List all links | 200 |
| GET | /api/links/:code | Get link stats | 200, 404 |
| DELETE | /api/links/:code | Delete link | 200, 404 |
| GET | /:code | Redirect to URL | 302, 404 |
| GET | /healthz | Health check | 200 |

### Validation Rules
- **Short Codes**: [A-Za-z0-9]{6,8} (6-8 alphanumeric characters)
- **URLs**: Must start with http:// or https://
- **Duplicate Codes**: Return 409 Conflict
- **Deleted Links**: Return 404 Not Found

### UI/UX Features
- ✅ Clean, responsive design (mobile, tablet, desktop)
- ✅ Purple gradient header matching spec
- ✅ Form validation with inline error messages
- ✅ Empty state messages
- ✅ Success/error notifications
- ✅ Loading states
- ✅ Copy to clipboard buttons
- ✅ Search/filter functionality
- ✅ Truncated URLs with ellipsis in table

## File Structure

```
tinylink-app/
├── server.js                 # Express server with all routes & API endpoints
├── package.json              # Dependencies (express, pg, dotenv)
├── .env                      # Environment variables (git ignored)
├── .env.example              # Environment template for setup
├── db/
│   ├── config.js            # PostgreSQL connection pool
│   └── init.js              # Database initialization & table creation
├── public/
│   ├── index.html           # Dashboard page
│   ├── stats.html           # Stats page for /code/:code
│   ├── script.js            # Dashboard JavaScript
│   ├── stats.js             # Stats page JavaScript
│   └── styles.css           # Stylesheet (responsive CSS)
├── README.md                # Project overview
├── POSTGRES_SETUP.md        # PostgreSQL setup instructions
└── IMPLEMENTATION_GUIDE.md  # This file
```

## Technology Stack

- **Runtime**: Node.js v22+
- **Framework**: Express.js 4.18.2
- **Database**: PostgreSQL with pg 8.11.0
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Environment**: dotenv 16.3.1

## Environment Variables

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/tinylink_db
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000
```

## Database Schema

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

## API Response Examples

### Create Link (POST /api/links)
**Request:**
```json
{
  "target_url": "https://github.com",
  "short_code": "github"
}
```

**Success Response (201):**
```json
{
  "id": 1,
  "short_code": "github",
  "target_url": "https://github.com",
  "total_clicks": 0,
  "last_clicked": null,
  "created_at": "2025-11-20T10:30:00.000Z",
  "updated_at": "2025-11-20T10:30:00.000Z"
}
```

**Duplicate Code (409):**
```json
{
  "error": "Code already exists"
}
```

### List Links (GET /api/links)
**Response (200):**
```json
[
  {
    "id": 1,
    "short_code": "github",
    "target_url": "https://github.com",
    "total_clicks": 5,
    "last_clicked": "2025-11-20T12:00:00.000Z",
    "created_at": "2025-11-20T10:30:00.000Z",
    "updated_at": "2025-11-20T10:30:00.000Z"
  }
]
```

### Get Link Stats (GET /api/links/:code)
**Response (200):**
```json
{
  "id": 1,
  "short_code": "github",
  "target_url": "https://github.com",
  "total_clicks": 5,
  "last_clicked": "2025-11-20T12:00:00.000Z",
  "created_at": "2025-11-20T10:30:00.000Z",
  "updated_at": "2025-11-20T10:30:00.000Z"
}
```

### Delete Link (DELETE /api/links/:code)
**Response (200):**
```json
{
  "message": "Link deleted successfully"
}
```

### Redirect (GET /:code)
- **Success (302)**: Redirects to target_url, increments total_clicks
- **Not Found (404)**: Returns HTML "404 - Link Not Found"

### Health Check (GET /healthz)
**Response (200):**
```json
{
  "ok": true,
  "version": "1.0"
}
```

## Key Implementation Details

### 1. Code Generation
- Auto-generated codes are 6-8 random alphanumeric characters
- Generated only if short_code is not provided

### 2. Click Tracking
- Each redirect updates `total_clicks` (incremented by 1)
- `last_clicked` timestamp is updated to NOW()
- Both happen atomically in a single UPDATE query

### 3. Validation
- **Frontend**: Client-side validation for UX feedback
- **Backend**: Server-side validation for security
- Invalid URLs or codes return 400 Bad Request

### 4. Error Handling
- Specific error messages for each validation failure
- Proper HTTP status codes (400, 404, 409, 503, 500)
- Database errors logged to console for debugging

### 5. Database Connection
- Connection pooling with pg-pool (efficient resource management)
- Automatic reconnection on failure
- SSL enabled in production (NODE_ENV=production)

### 6. UI/UX Enhancements
- Real-time search/filter by code or URL
- Visual feedback (copy notifications, success messages)
- Loading states during async operations
- Form validation with inline error messages
- Responsive design for all screen sizes

## Testing Checklist

### Manual Testing

1. **Health Check**
   - [ ] GET /healthz returns 200 { "ok": true, "version": "1.0" }

2. **Create Link**
   - [ ] POST /api/links with valid URL returns 201
   - [ ] Auto-generates 6-8 character code if not provided
   - [ ] Custom code works if valid 6-8 alphanumeric
   - [ ] Invalid URL returns 400
   - [ ] Duplicate custom code returns 409

3. **List Links**
   - [ ] GET /api/links returns array of all links
   - [ ] Dashboard displays all links in table

4. **Get Stats**
   - [ ] GET /api/links/:code returns 200 for valid code
   - [ ] GET /api/links/:code returns 404 for invalid code
   - [ ] Stats page loads correctly

5. **Redirect**
   - [ ] GET /:code redirects to target_url (302)
   - [ ] Click count increments after redirect
   - [ ] GET /:code returns 404 after deletion

6. **Delete**
   - [ ] DELETE /api/links/:code returns 200
   - [ ] Link disappears from dashboard
   - [ ] GET /:code returns 404 after deletion

7. **UI/UX**
   - [ ] Dashboard responsive on mobile/tablet/desktop
   - [ ] Form validation shows error messages
   - [ ] Search filters links correctly
   - [ ] Copy buttons work
   - [ ] Success messages appear
   - [ ] Empty state shows when no links

## Deployment Notes

### For Vercel + Neon PostgreSQL
1. Create Neon database at https://neon.tech
2. Get DATABASE_URL from Neon console
3. Deploy to Vercel: Connect GitHub repo
4. Set environment variables in Vercel dashboard
5. Database migrations run automatically on first deployment

### For Render + PostgreSQL
1. Create PostgreSQL database on Render
2. Create Express Web Service
3. Connect to GitHub repo
4. Set environment variables
5. Deploy

### For Railway + PostgreSQL
1. Create PostgreSQL service
2. Create Node.js service
3. Link services together
4. Set environment variables
5. Deploy

## Troubleshooting

### Database Connection Issues
- Check DATABASE_URL in .env
- Verify PostgreSQL is running
- Test with: `psql -U postgres -h localhost`

### Port Already in Use
- Check what's using port 3000: `lsof -i :3000`
- Kill process or use different PORT in .env

### Module Not Found
- Run: `npm install`
- Verify pg and dotenv are in package.json

### Links Not Persisting
- Check database connection with /healthz endpoint
- Verify tables created with: `psql -d tinylink_db -c "\dt"`

## Code Quality

- **Architecture**: Separation of concerns (routes, DB, frontend)
- **Error Handling**: Comprehensive try-catch with meaningful messages
- **Validation**: Client and server-side validation
- **Comments**: Clear inline comments explaining logic
- **Responsive**: Mobile-first CSS design
- **Accessibility**: Semantic HTML, proper form labels

## Summary

This TinyLink implementation meets all requirements in the assignment specification:
- ✅ All required endpoints implemented
- ✅ Proper HTTP status codes
- ✅ URL and code validation
- ✅ Click tracking functionality
- ✅ Clean, responsive UI
- ✅ Ready for deployment
- ✅ Follows autograding conventions
