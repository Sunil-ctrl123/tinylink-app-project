const { Pool } = require('pg');
require('dotenv').config();

let pool;

try {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:12345@localhost:5432/tinylink_db';
  
  pool = new Pool({
    connectionString: connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  pool.on('error', (err) => {
    console.error('Database error:', err.message);
  });
} catch (err) {
  console.error('Failed to create pool:', err.message);
  pool = null;
}

module.exports = pool;
