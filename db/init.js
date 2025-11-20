const pool = require('./config');

const initDb = async () => {
  if (!pool) {
    console.warn('⚠️  Database pool not available - skipping initialization');
    return;
  }

  try {
    await pool.query(`
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
    `);
    
    // Alter table if creation_count column doesn't exist (for existing databases)
    try {
      await pool.query(`
        ALTER TABLE links ADD COLUMN IF NOT EXISTS creation_count INTEGER DEFAULT 1;
      `);
    } catch (e) {
      // Column might already exist
    }
    
    console.log('✓ Database initialized successfully');
  } catch (error) {
    console.warn('⚠️  Database initialization warning:', error.message);
    console.warn('⚠️  Some features may not work without database connection');
  }
};

module.exports = initDb;
