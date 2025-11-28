import { Pool } from 'pg';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'stock_manager',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
});

async function debugProducts() {
    const client = await pool.connect();
    try {
        console.log('🌱 Starting DEBUG products...');

        // Set user ID
        await client.query("SET app.user_id = '1'");

        // Ensure category
        await client.query("INSERT INTO categorias (nombre) VALUES ('DebugCat') ON CONFLICT (nombre) DO NOTHING");
        const catRes = await client.query("SELECT id_categoria FROM categorias WHERE nombre = 'DebugCat'");
        const catId = catRes.rows[0].id_categoria;

        // Ensure unit
        await client.query("INSERT INTO unidades_medida (codigo, nombre) VALUES ('DBG', 'DebugUnit') ON CONFLICT (codigo) DO NOTHING");
        const unitRes = await client.query("SELECT id_unidad FROM unidades_medida WHERE codigo = 'DBG'");
        const unitId = unitRes.rows[0].id_unidad;

        // Ensure supplier
        await client.query("INSERT INTO proveedores (nit, nombre) VALUES ('DBG-SUP', 'Debug Sup') ON CONFLICT (nit) DO NOTHING");
        const supRes = await client.query("SELECT id_proveedor FROM proveedores WHERE nit = 'DBG-SUP'");
        const supId = supRes.rows[0].id_proveedor;

        // Try insert product
        console.log('Inserting product...');
        const product = {
            sku: `DBG-SKU-${Date.now()}`,
            codigo_barras: `DBG-BAR-${Date.now()}`,
            nombre: 'Debug Product',
            descripcion: 'Debug Desc',
            id_categoria: catId,
            id_unidad_medida: unitId,
            id_proveedor_principal: supId
        };

        const res = await client.query(
            `INSERT INTO productos (sku, codigo_barras, nombre, descripcion, id_categoria, id_unidad_medida, id_proveedor_principal)
             VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (sku) DO NOTHING RETURNING id_producto`,
            [product.sku, product.codigo_barras, product.nombre, product.descripcion, product.id_categoria, product.id_unidad_medida, product.id_proveedor_principal]
        );
        console.log('✅ Product inserted!', res.rows[0]);

    } catch (error: any) {
        console.error('❌ Error:', error.message);
        if (error.code) console.error('Code:', error.code);
    } finally {
        client.release();
        await pool.end();
    }
}

debugProducts();
