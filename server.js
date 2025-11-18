/**
 * TINYLINK - URL SHORTENER APPLICATION
 * 
 * This file contains the server setup and API routes
 * for shortening URLs and redirecting to original URLs.
 */

// Import required modules
const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app = express();

// Define the port where the server will run
const PORT = 3000;

// Path to our JSON file that stores URL mappings
const urlDatabasePath = path.join(__dirname, 'urls.json');

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Middleware to parse JSON request bodies
// This allows us to read JSON data sent by the client
app.use(express.json());

// Middleware to parse URL-encoded form data
// This is needed when forms are submitted from HTML
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' folder
// This allows us to serve CSS, images, and client-side JS
app.use(express.static('public'));

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Load all URL mappings from the JSON file
 * If file doesn't exist, return an empty object
 * 
 * @returns {Object} Object containing all URL mappings
 */
function loadUrls() {
  try {
    if (fs.existsSync(urlDatabasePath)) {
      const data = fs.readFileSync(urlDatabasePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading URLs:', error.message);
  }
  return {}; // Return empty object if file doesn't exist or has error
}

/**
 * Save URL mappings to the JSON file
 * 
 * @param {Object} urls - Object containing all URL mappings
 */
function saveUrls(urls) {
  try {
    fs.writeFileSync(urlDatabasePath, JSON.stringify(urls, null, 2));
  } catch (error) {
    console.error('Error saving URLs:', error.message);
  }
}

/**
 * Generate a short unique code for the URL
 * Using UUID and taking first 8 characters
 * 
 * @returns {String} Short unique code
 */
function generateShortCode() {
  // uuidv4() generates: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  // We take only the first 8 characters to keep it short
  return uuidv4().replace(/-/g, '').substring(0, 8);
}

/**
 * Validate if a URL is properly formatted
 * 
 * @param {String} url - URL to validate
 * @returns {Boolean} true if valid, false otherwise
 */
function isValidUrl(url) {
  try {
    // Try to parse the URL
    // If it throws an error, it's not a valid URL
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

// ============================================
// ROUTES
// ============================================

/**
 * GET / - Display the home page (index.html)
 * This serves our HTML form for shortening URLs
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * POST /api/shorten - Create a shortened URL
 * 
 * Expected request body:
 * {
 *   "originalUrl": "https://example.com/very/long/url"
 * }
 * 
 * Response:
 * {
 *   "shortCode": "abc12345",
 *   "shortUrl": "http://localhost:3000/abc12345",
 *   "originalUrl": "https://example.com/very/long/url"
 * }
 */
app.post('/api/shorten', (req, res) => {
  // Get the original URL from the request body
  const { originalUrl } = req.body;

  // Check if URL was provided
  if (!originalUrl) {
    return res.status(400).json({
      error: 'Please provide a URL to shorten'
    });
  }

  // Validate the URL format
  if (!isValidUrl(originalUrl)) {
    return res.status(400).json({
      error: 'Invalid URL format. Please provide a valid URL (e.g., https://example.com)'
    });
  }

  // Load existing URLs from file
  let urls = loadUrls();

  // Generate a unique short code
  let shortCode = generateShortCode();

  // Make sure the generated code is unique
  // Keep generating until we get a unique one
  while (urls[shortCode]) {
    shortCode = generateShortCode();
  }

  // Store the mapping: shortCode -> originalUrl
  urls[shortCode] = {
    originalUrl: originalUrl,
    createdAt: new Date().toISOString(),
    clicks: 0
  };

  // Save to file
  saveUrls(urls);

  // Send the response with the short URL details
  res.json({
    shortCode: shortCode,
    shortUrl: `http://localhost:${PORT}/${shortCode}`,
    originalUrl: originalUrl,
    message: 'URL shortened successfully!'
  });
});

/**
 * GET /:shortCode - Redirect to original URL
 * 
 * When user clicks on a short link, we:
 * 1. Look up the original URL
 * 2. Increment the click counter
 * 3. Redirect to the original URL
 */
app.get('/:shortCode', (req, res) => {
  // Get the short code from the URL parameter
  const { shortCode } = req.params;

  // Load all URL mappings
  let urls = loadUrls();

  // Check if the short code exists
  if (!urls[shortCode]) {
    return res.status(404).send(`
      <html>
        <head>
          <title>Link Not Found</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 10px;
              text-align: center;
              box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            }
            h1 { color: #333; margin: 0 0 10px 0; }
            p { color: #666; margin: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>404 - Link Not Found</h1>
            <p>Sorry, the short link you're looking for doesn't exist.</p>
          </div>
        </body>
      </html>
    `);
  }

  // Get the original URL
  const originalUrl = urls[shortCode].originalUrl;

  // Increment the click counter
  urls[shortCode].clicks++;
  urls[shortCode].lastAccessedAt = new Date().toISOString();

  // Save the updated data
  saveUrls(urls);

  // Redirect the user to the original URL
  // HTTP 301 means permanent redirect
  res.redirect(301, originalUrl);
});

/**
 * GET /api/stats/:shortCode - Get statistics for a short link
 * 
 * Returns:
 * {
 *   "shortCode": "abc12345",
 *   "originalUrl": "https://example.com",
 *   "clicks": 5,
 *   "createdAt": "2025-11-18T10:30:00.000Z"
 * }
 */
app.get('/api/stats/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  let urls = loadUrls();

  if (!urls[shortCode]) {
    return res.status(404).json({
      error: 'Short code not found'
    });
  }

  res.json({
    shortCode: shortCode,
    originalUrl: urls[shortCode].originalUrl,
    clicks: urls[shortCode].clicks,
    createdAt: urls[shortCode].createdAt,
    lastAccessedAt: urls[shortCode].lastAccessedAt || 'Never'
  });
});

/**
 * GET /api/all - Get all shortened URLs (for debugging/admin)
 * Returns all URL mappings
 */
app.get('/api/all', (req, res) => {
  const urls = loadUrls();
  res.json(urls);
});

// ============================================
// ERROR HANDLING
// ============================================

/**
 * Handle 404 errors - route not found
 * This runs if no other route matches
 */
app.use((req, res) => {
  res.status(404).send(`
    <html>
      <head>
        <title>Page Not Found</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          }
          h1 { color: #333; margin: 0 0 10px 0; }
          p { color: #666; margin: 0; }
          a { color: #667eea; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>404 - Page Not Found</h1>
          <p>The page you're looking for doesn't exist.</p>
          <p><a href="/">Go back to home</a></p>
        </div>
      </body>
    </html>
  `);
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`
    ╔════════════════════════════════════════╗
    ║   TinyLink - URL Shortener Started     ║
    ║                                        ║
    ║   Server running at:                   ║
    ║   http://localhost:${PORT}              ║
    ║                                        ║
    ║   API Endpoints:                       ║
    ║   POST   /api/shorten - Shorten URL    ║
    ║   GET    /:shortCode - Redirect        ║
    ║   GET    /api/stats/:shortCode - Stats ║
    ║   GET    /api/all - View all URLs      ║
    ╚════════════════════════════════════════╝
  `);
});
