import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

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