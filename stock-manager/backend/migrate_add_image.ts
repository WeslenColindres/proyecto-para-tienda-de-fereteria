
import { query } from './src/infrastructure/database/postgres';
import dotenv from 'dotenv';

dotenv.config();

async function migrate() {
    try {
        await query(`
      ALTER TABLE productos 
      ADD COLUMN IF NOT EXISTS imagen_url TEXT;
    `);
        console.log('Migration successful: Added imagen_url to productos table.');
    } catch (err) {
        console.error('Migration failed:', err);
    }
}

migrate();
