const pool = require('./db/config');

async function clearDatabase() {
  try {
    console.log('Clearing all test data...\n');

    // Delete all links
    const result = await pool.query('DELETE FROM links');
    console.log(`✓ Deleted ${result.rowCount} links from database`);

    // Verify
    const count = await pool.query('SELECT COUNT(*) as count FROM links');
    console.log(`✓ Current links in database: ${count.rows[0].count}`);

    await pool.end();
    console.log('\n✅ Database cleared! Ready for fresh data.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

clearDatabase();
