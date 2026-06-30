/**
 * MySQL Connection Pool — Coding House Admin
 * Uses mysql2/promise for async/await + parameterized queries.
 */
const mysql = require('mysql2/promise');

let pool = null;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host:     process.env.MYSQL_HOST || 'localhost',
      port:     parseInt(process.env.MYSQL_PORT || '3306', 10),
      user:     process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'codinghouse',
      waitForConnections: true,
      connectionLimit:    10,
      queueLimit:         0,
      enableKeepAlive:    true,
      keepAliveInitialDelay: 0
    });

    console.log('[DB] MySQL connection pool created');
  }
  return pool;
}

/**
 * Execute a parameterized query.
 * @param {string} sql  — SQL with ? placeholders
 * @param {Array}  params — values for placeholders
 * @returns {Promise<[rows, fields]>}
 */
async function query(sql, params = []) {
  const p = getPool();
  return p.execute(sql, params);
}

/**
 * Health check — test the connection.
 */
async function testConnection() {
  try {
    const p = getPool();
    await p.query('SELECT 1');
    console.log('[DB] MySQL connection verified ✓');
    return true;
  } catch (err) {
    console.error('[DB] MySQL connection FAILED:', err.message);
    return false;
  }
}

module.exports = { getPool, query, testConnection };
