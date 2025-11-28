import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'stock_manager',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
});

async function testConn() {
    console.log('Connecting...');
    const client = await pool.connect();
    try {
        console.log('Connected!');
        const res = await client.query('SELECT NOW()');
        console.log('Time:', res.rows[0]);
    } catch (err: any) {
        console.error('Error:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

testConn();
