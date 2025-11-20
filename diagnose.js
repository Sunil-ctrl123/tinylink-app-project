/**
 * Diagnostic script to test database connection and API
 * Run this locally to verify everything works before deploying
 */

const pool = require('./db/config');

async function runDiagnostics() {
  console.log('🔍 Running TinyLink Diagnostics...\n');

  try {
    // Test 1: Pool connection
    console.log('Test 1: Database Connection');
    console.log('==========================');
    if (!pool) {
      console.error('❌ Pool is null - database connection failed');
      return;
    }
    console.log('✓ Pool created successfully');

    // Test 2: Query execution
    console.log('\nTest 2: Execute Test Query');
    console.log('==========================');
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✓ Query successful');
    console.log(`  Current time: ${result.rows[0].current_time}`);

    // Test 3: Check links table
    console.log('\nTest 3: Links Table Structure');
    console.log('=============================');
    const tableInfo = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'links'
      ORDER BY ordinal_position
    `);
    
    if (tableInfo.rows.length === 0) {
      console.error('❌ Links table does not exist!');
    } else {
      console.log(`✓ Links table has ${tableInfo.rows.length} columns:`);
      tableInfo.rows.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type})`);
      });
    }

    // Test 4: Try to insert test data
    console.log('\nTest 4: Insert Test Data');
    console.log('========================');
    const testUrl = 'https://www.example.com/test-' + Date.now();
    const testCode = 'TEST' + Math.random().toString(36).substring(2, 6).toUpperCase();
    
    const insertResult = await pool.query(
      'INSERT INTO links (short_code, target_url, total_clicks, creation_count, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *',
      [testCode, testUrl, 0, 1]
    );
    
    console.log('✓ Insert successful');
    console.log(`  Short Code: ${insertResult.rows[0].short_code}`);
    console.log(`  URL: ${insertResult.rows[0].target_url}`);
    console.log(`  ID: ${insertResult.rows[0].id}`);

    // Test 5: Retrieve data
    console.log('\nTest 5: Retrieve Data');
    console.log('=====================');
    const getResult = await pool.query('SELECT * FROM links ORDER BY created_at DESC LIMIT 1');
    console.log('✓ Retrieve successful');
    console.log(`  Total links: ${getResult.rowCount}`);
    if (getResult.rows.length > 0) {
      console.log(`  Latest: ${getResult.rows[0].short_code}`);
    }

    // Test 6: Check environment
    console.log('\nTest 6: Environment Variables');
    console.log('=============================');
    console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    console.log(`  DATABASE_URL: ${process.env.DATABASE_URL ? '✓ Set' : '❌ NOT SET'}`);
    if (process.env.DATABASE_URL) {
      const urlParts = process.env.DATABASE_URL.split('@');
      const host = urlParts[1] ? urlParts[1].split('/')[0] : 'unknown';
      console.log(`  Database Host: ${host}`);
    }
    console.log(`  PORT: ${process.env.PORT || '3000'}`);

    console.log('\n✅ All diagnostics passed!');
    console.log('\nYour database is working correctly locally.');
    console.log('If you\'re still getting 500 on Vercel:');
    console.log('1. Check Vercel Environment Variables');
    console.log('2. Verify DATABASE_URL is set correctly');
    console.log('3. Check Vercel Function Logs');
    console.log('4. Redeploy the application');

    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    console.error('\nFull Error:');
    console.error(err);
    
    console.log('\n📋 Troubleshooting:');
    if (err.message.includes('ECONNREFUSED')) {
      console.log('- PostgreSQL server is not running');
      console.log('- Check DATABASE_URL connection string');
    } else if (err.message.includes('password')) {
      console.log('- Incorrect database password');
      console.log('- Verify DATABASE_URL is correct');
    } else if (err.message.includes('does not exist')) {
      console.log('- Database or table does not exist');
      console.log('- Run: node db/init.js');
    }

    await pool.end();
    process.exit(1);
  }
}

runDiagnostics();
