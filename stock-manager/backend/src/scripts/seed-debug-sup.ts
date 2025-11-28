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

async function debugSeed() {
    const client = await pool.connect();
    try {
        console.log('🌱 Starting DEBUG seed for Suppliers...');

        // Try hardcoded insert
        console.log('Attempting hardcoded supplier insert...');
        await client.query(
            "INSERT INTO proveedores (nit, nombre, nombre_comercial, email, telefono, direccion, dias_entrega) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (nit) DO NOTHING",
            ['DEBUG-NIT-SUP', 'Debug Supplier', 'Debug Commercial', 'debug@sup.com', '12345678', 'Debug Address', 3]
        );
        console.log('✅ Hardcoded supplier insert successful!');

    } catch (error: any) {
        console.error('❌ Error:', error.message);
        if (error.code) console.error('Code:', error.code);
    } finally {
        client.release();
        await pool.end();
    }
}

debugSeed();
