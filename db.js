require('dotenv').config();
const { Pool } = require('pg');

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT } = process.env;

const pool = new Pool({
  host: PGHOST || '127.0.0.1',
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
  port: PGPORT || 5432,
  ssl: {
    rejectUnauthorized: false, // Use only if necessary for your environment
  },
  max: 10, // Set the maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

async function getPgVersion() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT version()');
    console.log(result.rows[0]);
  } catch (error) {
    console.error('Error fetching PostgreSQL version:', error);
    // Optionally capture stack trace for deeper debugging
    if (error instanceof Error) {
      Error.captureStackTrace(error);
    }
  } finally {
    client.release();
  }
}

getPgVersion();
