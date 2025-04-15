import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';


const pool = new Pool({
    connectionString: process.env.POSTGRES_URL
});
const createTableQuery = fs.readFileSync(path.resolve(__dirname, './schema.sql'), 'utf-8');

async function initDatabase() {
    try {
        await pool.query(createTableQuery);
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        await pool.end();
    }
}

initDatabase();