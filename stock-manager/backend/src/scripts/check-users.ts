import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'stock_manager',
    password: process.env.DB_PASSWORD || 'postgres',
    port: 5432,
});

async function checkUsers() {
    try {
        const res = await pool.query('SELECT id, username, email, is_active, failed_attempts FROM usuarios');
        console.log('Users found:', res.rows);
    } catch (err) {
        console.error('Error querying users:', err);
    } finally {
        await pool.end();
    }
}

checkUsers();
