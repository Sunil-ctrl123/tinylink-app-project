const { Pool } = require('pg');
require('dotenv').config();

let pool;

try {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.warn('⚠️  WARNING: DATABASE_URL not set');
    console.warn('⚠️  Please set DATABASE_URL environment variable');
    console.warn('⚠️  Using fallback connection (localhost)');
  }
  
  const dbUrl = connectionString || 'postgresql://postgres:12345@localhost:5432/tinylink_db';
  
  pool = new Pool({
    connectionString: dbUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  pool.on('error', (err) => {
    console.error('Database connection error:', err.message);
  });
  
  // Test connection
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('❌ Database connection failed:', err.message);
    } else {
      console.log('✓ Database connection successful');
    }
  });
} catch (err) {
  console.error('Failed to create pool:', err.message);
  pool = null;
}

module.exports = pool;

