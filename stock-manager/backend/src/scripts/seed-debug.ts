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
        console.log('🌱 Starting DEBUG seed...');

        // Check triggers
        const triggers = await client.query("SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'clientes'");
        console.log('Triggers on clientes:', triggers.rows);

        // Ensure client type
        await client.query("INSERT INTO tipos_cliente (nombre) VALUES ('DebugType') ON CONFLICT (nombre) DO NOTHING");
        const typeRes = await client.query("SELECT id_tipo_cliente FROM tipos_cliente WHERE nombre = 'DebugType'");
        const typeId = typeRes.rows[0].id_tipo_cliente;
        console.log('Type ID:', typeId);

        // Try hardcoded insert
        console.log('Attempting hardcoded insert...');
        await client.query(
            "INSERT INTO clientes (nit, nombre, id_tipo_cliente, email, telefono, limite_credito, dias_credito) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (nit) DO NOTHING",
            ['DEBUG-NIT', 'Debug Customer', typeId, 'debug@test.com', '12345678', 1000, 30]
        );
        console.log('✅ Hardcoded insert successful!');

    } catch (error: any) {
        console.error('❌ Error:', error.message);
        if (error.code) console.error('Code:', error.code);
    } finally {
        client.release();
        await pool.end();
    }
}

debugSeed();
