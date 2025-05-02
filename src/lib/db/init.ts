import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

// Create a singleton pool that can be reused across API calls
let pool: Pool | null = null;

export const getPool = () => {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL
    });
  }
  return pool;
};

export async function initDatabase() {
  try {
    const createTableQuery = fs.readFileSync(path.resolve(process.cwd(), 'src/lib/db/schema.sql'), 'utf-8');
    const pool = getPool();
    await pool.query(createTableQuery);
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}

// Export a cleanup function for use in development or testing
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('Database connection pool closed');
  }
}

// Only run init on direct execution (not when imported)
if (require.main === module) {
  initDatabase().then(() => closePool());
}