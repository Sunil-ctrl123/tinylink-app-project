/**
 * TINYLINK - URL SHORTENER APPLICATION
 * 
 * Node.js + Express + PostgreSQL URL shortener
 */

const express = require('express');
const path = require('path');
require('dotenv').config();

const pool = require('./db/config');
const initDb = require('./db/init');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE SETUP
// ============================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateShortCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = Math.floor(Math.random() * 3) + 6; // 6-8 characters
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

function isValidCode(code) {
  const regex = /^[A-Za-z0-9]{6,8}$/;
  return regex.test(code);
}

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.json({ ok: true, version: '1.0' });
});

// Dashboard page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Stats page
app.get('/code/:code', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'stats.html'));
});

// API: Create link
app.post('/api/links', async (req, res) => {
  const { target_url, short_code } = req.body;

  // Validate URL
  if (!target_url || !isValidUrl(target_url)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }

  try {
    // If custom code is provided, validate it
    if (short_code && !isValidCode(short_code)) {
      return res.status(400).json({ error: 'Code must be 6-8 alphanumeric characters' });
    }

    // If custom code is provided, check if it exists
    if (short_code) {
      const existing = await pool.query(
        'SELECT id, target_url, total_clicks, creation_count, last_clicked, created_at, updated_at FROM links WHERE short_code = $1',
        [short_code]
      );

      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Code already exists' });
      }

      // Create link with custom code
      const result = await pool.query(
        'INSERT INTO links (short_code, target_url, total_clicks, creation_count, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id, short_code, target_url, total_clicks, creation_count, last_clicked, created_at, updated_at',
        [short_code, target_url, 0, 1]
      );

      return res.status(201).json(result.rows[0]);
    }

    // If no custom code, check if target URL already exists
    const existingUrl = await pool.query(
      'SELECT id, short_code, target_url, total_clicks, creation_count, last_clicked, created_at, updated_at FROM links WHERE target_url = $1',
      [target_url]
    );

    if (existingUrl.rows.length > 0) {
      // Increment creation count for existing URL
      const updated = await pool.query(
        'UPDATE links SET creation_count = creation_count + 1, updated_at = NOW() WHERE id = $1 RETURNING id, short_code, target_url, total_clicks, creation_count, last_clicked, created_at, updated_at',
        [existingUrl.rows[0].id]
      );
      
      return res.status(200).json({
        ...updated.rows[0],
        message: 'URL already exists. Creation count incremented.'
      });
    }

    // Create new link with auto-generated code
    let code = generateShortCode();
    
    // Ensure generated code is unique
    let codeExists = true;
    while (codeExists) {
      const codeCheck = await pool.query(
        'SELECT id FROM links WHERE short_code = $1',
        [code]
      );
      if (codeCheck.rows.length === 0) {
        codeExists = false;
      } else {
        code = generateShortCode();
      }
    }

    const result = await pool.query(
      'INSERT INTO links (short_code, target_url, total_clicks, creation_count, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id, short_code, target_url, total_clicks, creation_count, last_clicked, created_at, updated_at',
      [code, target_url, 0, 1]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API: List all links
app.get('/api/links', async (req, res) => {
  if (!pool) {
    return res.json([]);
  }

  try {
    const result = await pool.query(
      'SELECT * FROM links ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching links:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API: Get link stats
app.get('/api/links/:code', async (req, res) => {
  const { code } = req.params;

  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM links WHERE short_code = $1',
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Link not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API: Delete link
app.delete('/api/links/:code', async (req, res) => {
  const { code } = req.params;

  if (!pool) {
    return res.status(503).json({ error: 'Database not available' });
  }

  try {
    const result = await pool.query(
      'DELETE FROM links WHERE short_code = $1 RETURNING *',
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Link not found' });
    }

    res.json({ message: 'Link deleted successfully' });
  } catch (error) {
    console.error('Error deleting link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Redirect to original URL
app.get('/:code', async (req, res) => {
  const { code } = req.params;

  try {
    const result = await pool.query(
      'UPDATE links SET total_clicks = total_clicks + 1, last_clicked = NOW() WHERE short_code = $1 RETURNING *',
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('<h1>404 - Link Not Found</h1>');
    }

    const link = result.rows[0];
    res.redirect(302, link.target_url);
  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).send('Internal server error');
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ============================================
// START SERVER
// ============================================

(async () => {
  try {
    // Initialize database
    await initDb();

    // Start server
    app.listen(PORT, () => {
      console.log(`
    ╔════════════════════════════════════════╗
    ║   TinyLink - URL Shortener Started     ║
    ║                                        ║
    ║   Server running at:                   ║
    ║   http://localhost:${PORT}              ║
    ║                                        ║
    ║   Dashboard: http://localhost:${PORT}/   ║
    ║   Health: http://localhost:${PORT}/healthz   ║
    ╚════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
