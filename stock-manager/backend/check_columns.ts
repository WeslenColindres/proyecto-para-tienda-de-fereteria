
import { query } from './src/infrastructure/database/postgres';
import dotenv from 'dotenv';

dotenv.config();

async function checkColumns() {
    try {
        const result = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'productos';
    `);
        console.log('Columns:', result.rows);
    } catch (err) {
        console.error('Error:', err);
    }
}

checkColumns();
