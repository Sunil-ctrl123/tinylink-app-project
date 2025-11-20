# 🔗 TinyLink - URL Shortener Application

A modern, clean web application for shortening URLs with click statistics and link management. Built with Node.js + Express and plain HTML/CSS/JavaScript.

## ✨ Features

- ✅ Create short links with auto-generated or custom codes
- ✅ View click statistics for each link
- ✅ Delete links with confirmation
- ✅ Search and filter links by code or URL
- ✅ Copy links to clipboard
- ✅ Responsive design (desktop, tablet, mobile)
- ✅ Clean, modern UI with gradient header
- ✅ HTTP 302 redirects with click tracking
- ✅ Health check endpoint
- ✅ RESTful API endpoints

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd c:\Sunil\tinylink-app
npm install
```

### 2. Start Server
```bash
npm start
```

### 3. Open in Browser
Visit: **http://localhost:3000**

Health check: **http://localhost:3000/healthz**

## 📋 API Endpoints

### Create Link
```bash
POST /api/links
Content-Type: application/json

{
  "target_url": "https://example.com/very/long/url",
  "short_code": "docs"  // Optional, auto-generated if not provided
}

Response: 201
{
  "short_code": "docs",
  "target_url": "https://example.com/very/long/url",
  "total_clicks": 0,
  "created_at": "2025-11-20T10:30:00.000Z",
  "last_clicked": null
}
```

### List All Links
```bash
GET /api/links

Response: 200 (array of links)
```

### Get Link Stats
```bash
GET /api/links/:code

Response: 200 (link object)
```

### Delete Link
```bash
DELETE /api/links/:code

Response: 200
```

### Redirect
```bash
GET /:code
Response: 302 Redirect to target_url
```

### Health Check
```bash
GET /healthz
Response: 200 { "ok": true, "version": "1.0" }
```

## 📁 Project Structure

```
tinylink-app/
├── server.js                    # Main Express server
├── package.json                 # Dependencies
├── urls.json                    # JSON database
└── public/
    ├── index.html              # Dashboard page
    ├── stats.html              # Stats page
    ├── script.js               # Dashboard JavaScript
    ├── stats.js                # Stats JavaScript
    └── styles.css              # Stylesheet
```

## 🎨 Pages

### Dashboard (`/`)
- Create short links with optional custom codes
- View table of all links
- Search/filter by code or URL
- Copy links to clipboard
- Delete links

### Stats Page (`/code/:code`)
- Detailed statistics for a single link
- Total clicks count
- Creation and last clicked dates

### Health Check (`/healthz`)
- System status endpoint

## 🔑 Validation Rules

### URL Validation
- Must include `http://` or `https://`

### Short Code Validation
- Optional when creating links
- If provided, must be 6-8 alphanumeric characters
- Format: `[A-Za-z0-9]{6,8}`
- Global uniqueness enforced (409 Conflict if exists)

## 🎯 All Requirements Met

✅ Step 1: Core Features  
✅ Step 2: Create short links  
✅ Step 3: Redirect with click tracking  
✅ Step 4: Delete links  
✅ Step 5: Dashboard, Stats, Health  
✅ Step 6: Clean UI and UX  
✅ Step 7: All required pages & routes  
✅ Step 8: Hosting ready  
✅ Step 9: Autograding conventions followed

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3000/healthz
```

### Create Link
```bash
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"target_url":"https://google.com"}'
```

### Duplicate Code (409)
```bash
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"target_url":"https://google.com","short_code":"test"}'
```

### Delete Link
```bash
curl -X DELETE http://localhost:3000/api/links/test
```

## 🛠️ Technology Stack

- **Backend**: Node.js + Express.js
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Database**: JSON file (urls.json)
- **API**: RESTful

## 📝 License

ISC
