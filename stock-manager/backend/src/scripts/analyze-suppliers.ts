import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'stock_manager',
    password: process.env.DB_PASSWORD || 'postgres',
    port: 5432, // Force port 5432 as per previous debugging
});

async function analyzeSuppliers() {
    const client = await pool.connect();
    try {
        console.log('📊 Starting Supplier Analysis...\n');

        // 1. General Supplier Stats
        const suppliersRes = await client.query(`
            SELECT 
                p.id_proveedor,
                p.nombre,
                p.nombre_comercial,
                p.nit,
                p.email,
                p.telefono,
                p.activo,
                COUNT(DISTINCT prod.id_producto) as total_productos,
                COUNT(DISTINCT oc.id_orden_compra) as total_ordenes,
                COALESCE(SUM(oc.total), 0) as total_comprado
            FROM proveedores p
            LEFT JOIN productos prod ON p.id_proveedor = prod.id_proveedor_principal
            LEFT JOIN ordenes_compra oc ON p.id_proveedor = oc.id_proveedor
            GROUP BY p.id_proveedor, p.nombre, p.nombre_comercial, p.nit, p.email, p.telefono, p.activo
            ORDER BY total_comprado DESC, total_productos DESC;
        `);

        console.log(`Found ${suppliersRes.rowCount} suppliers:\n`);

        for (const supplier of suppliersRes.rows) {
            console.log(`🏢 [ID: ${supplier.id_proveedor}] ${supplier.nombre} (${supplier.nombre_comercial || 'N/A'})`);
            console.log(`   NIT: ${supplier.nit} | Tel: ${supplier.telefono || 'N/A'} | Email: ${supplier.email || 'N/A'}`);
            console.log(`   Status: ${supplier.activo ? '✅ Active' : '❌ Inactive'}`);
            console.log(`   Products Supplied: ${supplier.total_productos}`);
            console.log(`   Purchase Orders: ${supplier.total_ordenes}`);
            console.log(`   Total Purchased Volume: Q${parseFloat(supplier.total_comprado).toFixed(2)}`);

            // Get contacts for this supplier
            const contactsRes = await client.query(`
                SELECT nombre_contacto, cargo, email, telefono 
                FROM contactos_proveedor 
                WHERE id_proveedor = $1
            `, [supplier.id_proveedor]);

            if (contactsRes.rowCount > 0) {
                console.log(`   👥 Contacts:`);
                contactsRes.rows.forEach(c => {
                    console.log(`      - ${c.nombre_contacto} (${c.cargo || 'No cargo'}) - ${c.email || ''} ${c.telefono || ''}`);
                });
            } else {
                console.log(`   👥 Contacts: None`);
            }
            console.log('---------------------------------------------------');
        }

        // 2. Products per Supplier Detail (Top 5 products per supplier)
        console.log('\n📦 Top Products by Supplier (Sample):');
        for (const supplier of suppliersRes.rows) {
            if (parseInt(supplier.total_productos) > 0) {
                const productsRes = await client.query(`
                    SELECT nombre, sku, precio 
                    FROM productos p
                    LEFT JOIN precios_producto pp ON p.id_producto = pp.id_producto AND pp.tipo_precio = 'PÚBLICO'
                    WHERE id_proveedor_principal = $1
                    LIMIT 3
                `, [supplier.id_proveedor]);

                console.log(`\n   ${supplier.nombre}:`);
                productsRes.rows.forEach(p => {
                    console.log(`      - [${p.sku}] ${p.nombre} (Price: Q${p.precio || 'N/A'})`);
                });
                if (parseInt(supplier.total_productos) > 3) {
                    console.log(`      ... and ${parseInt(supplier.total_productos) - 3} more.`);
                }
            }
        }

    } catch (error) {
        console.error('❌ Error analyzing suppliers:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

analyzeSuppliers();
