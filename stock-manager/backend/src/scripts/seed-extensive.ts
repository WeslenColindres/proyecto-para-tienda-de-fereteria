import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
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

async function seedExtensive() {
    const client = await pool.connect();
    try {
        console.log('🌱 Starting EXTENSIVE database seeding...');

        // Enable pgcrypto for audit hashes
        await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');

        // Set user ID for audit triggers
        await client.query("SET app.user_id = '1'");

        // 3. Create Suppliers
        console.log('Creating Suppliers...');
        const suppliers = [];
        for (let i = 0; i < 20; i++) {
            const supplier = {
                nit: `NIT-${i}-${Date.now()}`, // Unique NIT
                nombre: `Supplier ${i} - ${faker.company.name().substring(0, 50)}`,
                nombre_comercial: `Commercial ${i}`,
                email: `supplier${i}@test.com`,
                telefono: '12345678',
                direccion: 'Test Address ' + i,
                dias_entrega: 3
            };
            suppliers.push(supplier);
            await client.query(
                `INSERT INTO proveedores (nit, nombre, nombre_comercial, email, telefono, direccion, dias_entrega)
                 VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (nit) DO NOTHING`,
                [supplier.nit, supplier.nombre, supplier.nombre_comercial, supplier.email, supplier.telefono, supplier.direccion, supplier.dias_entrega]
            );
        }

        // 4. Create Customers
        console.log('Creating Customers...');

        // Ensure client types exist
        await client.query(`
            INSERT INTO tipos_cliente (nombre, descripcion) VALUES 
            ('Minorista', 'Cliente regular'),
            ('Mayorista', 'Cliente con descuento')
            ON CONFLICT (nombre) DO NOTHING
        `);

        // Get client type IDs
        const typeRes = await client.query('SELECT id_tipo_cliente FROM tipos_cliente');
        const typeIds = typeRes.rows.map(r => r.id_tipo_cliente);

        const customers = [];
        for (let i = 0; i < 50; i++) {
            const customer = {
                nit: `CF-${i}-${Date.now()}`, // Unique NIT
                nombre: `Customer ${i} - ${faker.person.fullName().substring(0, 50)}`,
                id_tipo_cliente: typeIds[0], // Use first type safely
                email: `customer${i}@test.com`,
                telefono: '87654321',
                limite_credito: 1000 + (i * 100),
                dias_credito: 30
            };
            customers.push(customer);
            await client.query(
                `INSERT INTO clientes (nit, nombre, id_tipo_cliente, email, telefono, limite_credito, dias_credito)
                 VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (nit) DO NOTHING`,
                [customer.nit, customer.nombre, customer.id_tipo_cliente, customer.email, customer.telefono, customer.limite_credito, customer.dias_credito]
            );
        }

        // 5. Create Products
        console.log('Creating Products...');
        // Get supplier IDs
        const supplierRes = await client.query('SELECT id_proveedor FROM proveedores');
        const supplierIds = supplierRes.rows.map(r => r.id_proveedor);

        // Get category IDs
        const categoryRes = await client.query('SELECT id_categoria FROM categorias');
        const categoryIds = categoryRes.rows.map(r => r.id_categoria);

        if (categoryIds.length === 0) {
            // Ensure categories exist if empty
            await client.query(`
                INSERT INTO categorias (nombre, descripcion) VALUES 
                ('General', 'Productos generales'),
                ('Herramientas', 'Herramientas varias')
                ON CONFLICT (nombre) DO NOTHING
            `);
            const newCatRes = await client.query('SELECT id_categoria FROM categorias');
            categoryIds.push(...newCatRes.rows.map(r => r.id_categoria));
        }

        // Ensure units exist
        await client.query(`
            INSERT INTO unidades_medida (codigo, nombre) VALUES 
            ('UND', 'Unidad')
            ON CONFLICT (codigo) DO NOTHING
        `);
        const unitRes = await client.query("SELECT id_unidad FROM unidades_medida WHERE codigo = 'UND'");
        const unitId = unitRes.rows[0].id_unidad;

        for (let i = 0; i < 50; i++) {
            const product = {
                sku: `SKU-${i}-${Date.now()}`,
                codigo_barras: `BAR-${i}-${Date.now()}`,
                nombre: `Product ${i} - ${faker.commerce.productName().substring(0, 50)}`,
                descripcion: 'Description ' + i,
                id_categoria: categoryIds[0], // Use first category safely
                id_unidad_medida: unitId,
                id_proveedor_principal: supplierIds[0] // Use first supplier safely
            };

            const res = await client.query(
                `INSERT INTO productos (sku, codigo_barras, nombre, descripcion, id_categoria, id_unidad_medida, id_proveedor_principal)
                 VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (sku) DO NOTHING RETURNING id_producto`,
                [product.sku, product.codigo_barras, product.nombre, product.descripcion, product.id_categoria, product.id_unidad_medida, product.id_proveedor_principal]
            );

            if (res.rows.length > 0) {
                const productId = res.rows[0].id_producto;
                // Add Price
                await client.query(
                    `INSERT INTO precios_producto (id_producto, tipo_precio, precio, fecha_vigencia_inicio)
                     VALUES ($1, 'PÚBLICO', $2, NOW()) ON CONFLICT DO NOTHING`,
                    [productId, 100 + i]
                );
                // Add Stock
                await client.query(
                    `INSERT INTO stock_producto (id_producto, id_sucursal, cantidad_disponible)
                     VALUES ($1, 1, $2) ON CONFLICT DO NOTHING`,
                    [productId, 50 + i]
                );
            }
        }

        console.log('✅ Extensive seeding completed successfully!');
    } catch (error: any) {
        console.error('❌ Error seeding database:', error.message);
        if (error.detail) console.error('Detail:', error.detail);
    } finally {
        client.release();
        await pool.end();
    }
}

seedExtensive();
