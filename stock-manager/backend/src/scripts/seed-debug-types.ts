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

async function debugTypes() {
    const client = await pool.connect();
    try {
        console.log('🌱 Starting DEBUG types...');

        // Check triggers
        const triggers = await client.query("SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'tipos_cliente'");
        console.log('Triggers on tipos_cliente:', triggers.rows);

        // Try insert
        console.log('Inserting types...');
        await client.query(`
            INSERT INTO tipos_cliente (nombre, descripcion) VALUES 
            ('Minorista', 'Cliente regular'),
            ('Mayorista', 'Cliente con descuento')
            ON CONFLICT (nombre) DO NOTHING
        `);
        console.log('✅ Types inserted!');

    } catch (error: any) {
        console.error('❌ Error:', error.message);
        if (error.code) console.error('Code:', error.code);
    } finally {
        client.release();
        await pool.end();
    }
}

debugTypes();
