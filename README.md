# TinyLink - URL Shortener Application

A simple and elegant URL shortener built with **Node.js** and **Express.js**. Perfect for beginners learning Node.js!

## 📋 Features

✅ **Shorten URLs** - Convert long URLs into short, shareable links  
✅ **Click Tracking** - Count how many times each shortened link is accessed  
✅ **Permanent Redirects** - Use HTTP 301 redirects for SEO-friendly short links  
✅ **Simple UI** - Clean, modern interface with gradient design  
✅ **Persistent Storage** - URLs saved to `urls.json` file  
✅ **API Endpoints** - RESTful API for integration  
✅ **Stats** - View statistics for each shortened URL  
✅ **Responsive Design** - Works on desktop, tablet, and mobile  

## 🚀 Quick Start

### 1. **Prerequisites**
You need to have Node.js installed on your computer.
- Download from: https://nodejs.org/
- Download the **LTS (Long Term Support)** version

### 2. **Installation**

```bash
# Navigate to the project folder
cd c:\Sunil\tinylink-app

# Install dependencies
npm install
```

This will install:
- **express**: Web framework for Node.js
- **uuid**: For generating unique codes

### 3. **Run the Application**

```bash
npm start
```

You should see:
```
╔════════════════════════════════════════╗
║   TinyLink - URL Shortener Started     ║
║                                        ║
║   Server running at:                   ║
║   http://localhost:3000                ║
╚════════════════════════════════════════╝
```

### 4. **Open in Browser**

Open your web browser and go to:
```
http://localhost:3000
```

## 📚 How to Use

1. **Enter a Long URL**: Paste any URL (e.g., `https://www.google.com`)
2. **Click "Shorten URL"**: The app generates a short code
3. **Copy the Short Link**: Use the copy button to copy to clipboard
4. **Share**: Send the short URL to others
5. **Track**: When someone clicks, the counter increases

## 📁 Project Structure

```
tinylink-app/
│
├── server.js              # Main server file with all routes and logic
├── package.json           # Project dependencies and metadata
├── urls.json             # Database file (auto-created) storing URL mappings
│
└── public/               # Frontend files (HTML, CSS, JS)
    ├── index.html        # Main page
    ├── styles.css        # Styling and design
    └── script.js         # Client-side functionality
```

## 🔌 API Endpoints

### 1. **Shorten a URL**
```
POST /api/shorten
Content-Type: application/json

Body:
{
  "originalUrl": "https://example.com/very/long/url"
}

Response:
{
  "shortCode": "abc12345",
  "shortUrl": "http://localhost:3000/abc12345",
  "originalUrl": "https://example.com/very/long/url",
  "message": "URL shortened successfully!"
}
```

### 2. **Get Statistics for a Short Link**
```
GET /api/stats/abc12345

Response:
{
  "shortCode": "abc12345",
  "originalUrl": "https://example.com/very/long/url",
  "clicks": 5,
  "createdAt": "2025-11-18T10:30:00.000Z",
  "lastAccessedAt": "2025-11-18T15:45:00.000Z"
}
```

### 3. **Redirect to Original URL**
```
GET /abc12345

This redirects to the original URL and increments the click counter
```

### 4. **View All URLs** (for debugging)
```
GET /api/all

Returns all shortened URLs in JSON format
```

## 💡 Code Explanations for Beginners

### Understanding server.js

**What is Express?**
- Express is a web framework that makes it easy to create web servers in Node.js
- It handles routing, middleware, and HTTP requests/responses

**Key Concepts:**

1. **`require()`** - Imports modules/packages
   ```javascript
   const express = require('express');  // Import Express
   const fs = require('fs');            // Import file system
   ```

2. **`app.get()` and `app.post()`** - Handle different HTTP methods
   ```javascript
   app.get('/', (req, res) => { /* handle GET */ });
   app.post('/api/shorten', (req, res) => { /* handle POST */ });
   ```

3. **Middleware** - Functions that run before routes
   ```javascript
   app.use(express.json());  // Parse JSON bodies
   app.use(express.static('public'));  // Serve static files
   ```

4. **`req` and `res`** - Request and Response objects
   - `req.body` - Data sent by client
   - `req.params` - URL parameters (e.g., `:shortCode`)
   - `res.json()` - Send JSON response
   - `res.redirect()` - Redirect to another URL

### Understanding script.js

**Key JavaScript Concepts:**

1. **Async/Await** - Handle API calls
   ```javascript
   const response = await fetch('/api/shorten', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ originalUrl: originalUrl })
   });
   ```

2. **DOM Manipulation** - Update HTML elements
   ```javascript
   document.getElementById('urlInput').value = 'something';
   document.getElementById('resultsSection').style.display = 'block';
   ```

3. **Event Listeners** - React to user actions
   ```javascript
   urlForm.addEventListener('submit', handleFormSubmit);
   ```

### Understanding styles.css

**Key CSS Concepts:**

1. **CSS Variables (Custom Properties)** - Reusable values
   ```css
   :root {
     --primary-color: #667eea;
   }
   
   button {
     background: var(--primary-color);
   }
   ```

2. **Gradients** - Smooth color transitions
   ```css
   background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
   ```

3. **Flexbox** - Layout system
   ```css
   display: flex;
   gap: 16px;
   align-items: center;
   ```

4. **Animations** - Smooth transitions
   ```css
   @keyframes slideUp {
     from { transform: translateY(20px); }
     to { transform: translateY(0); }
   }
   ```

## 📝 Data Storage

URLs are stored in `urls.json`:
```json
{
  "abc12345": {
    "originalUrl": "https://example.com/very/long/url",
    "createdAt": "2025-11-18T10:30:00.000Z",
    "clicks": 5,
    "lastAccessedAt": "2025-11-18T15:45:00.000Z"
  }
}
```

## 🔧 Troubleshooting

### Port 3000 is already in use
Change the PORT in `server.js`:
```javascript
const PORT = 3001;  // Use a different port
```

### Module not found error
```bash
npm install
```

### File permissions error
Make sure you have read/write permissions in the project folder.

## 🎓 Learning Resources

- **Express.js Official Docs**: https://expressjs.com/
- **Node.js Official Docs**: https://nodejs.org/docs/
- **JavaScript MDN Docs**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/

## 🚀 Future Enhancements

- Add database (MongoDB/PostgreSQL) instead of JSON file
- User authentication and accounts
- URL expiration/TTL
- Analytics dashboard
- Custom short codes
- QR code generation
- API rate limiting

## 📄 License

This project is open source and available under the ISC license.

---

**Happy Coding! 🎉**
