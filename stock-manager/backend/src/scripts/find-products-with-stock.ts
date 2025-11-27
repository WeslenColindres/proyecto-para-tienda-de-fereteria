import { query } from '../infrastructure/database/postgres';

async function findProductsWithStock() {
    const result = await query(`
        SELECT p.id_producto, p.nombre, sp.cantidad_disponible, pp.precio
        FROM productos p
        INNER JOIN stock_producto sp ON p.id_producto = sp.id_producto
        LEFT JOIN precios_producto pp ON p.id_producto = pp.id_producto AND pp.activo = true AND pp.tipo_precio = 'VENTA'
        WHERE p.activo = true 
        AND sp.cantidad_disponible > 0 
        AND sp.id_sucursal = 7
        LIMIT 5
    `);

    console.log('\n📦 Productos con stock disponible en sucursal 7:\n');
    result.rows.forEach(row => {
        console.log(`  ID: ${row.id_producto} | ${row.nombre} | Stock: ${row.cantidad_disponible} | Precio: Q${row.precio || 'N/A'}`);
    });

    if (result.rows.length > 0) {
        console.log(`\n✅ Usar producto ID: ${result.rows[0].id_producto} para la venta de prueba`);
    }

    process.exit(0);
}

findProductsWithStock().catch(console.error);
