import { query } from '../infrastructure/database/postgres';

async function addInitialStock() {
    console.log('📦 Agregando stock inicial a productos...\n');

    try {
        // Get first 5 active products
        const products = await query(`
            SELECT id_producto, nombre 
            FROM productos 
            WHERE activo = true 
            LIMIT 5
        `);

        const branchId = 7; // Sucursal principal
        const initialStock = 100;

        for (const product of products.rows) {
            // Check if stock record exists
            const existingStock = await query(
                'SELECT id_stock FROM stock_producto WHERE id_producto = $1 AND id_sucursal = $2',
                [product.id_producto, branchId]
            );

            if (existingStock.rows.length > 0) {
                // Update existing stock
                await query(
                    `UPDATE stock_producto 
                     SET cantidad_disponible = $1, 
                         fecha_ultima_actualizacion = CURRENT_TIMESTAMP
                     WHERE id_producto = $2 AND id_sucursal = $3`,
                    [initialStock, product.id_producto, branchId]
                );
                console.log(`  ✅ Actualizado stock de "${product.nombre}": ${initialStock} unidades`);
            } else {
                // Insert new stock record
                await query(
                    `INSERT INTO stock_producto (id_producto, id_sucursal, cantidad_disponible, cantidad_reservada, cantidad_transito)
                     VALUES ($1, $2, $3, 0, 0)`,
                    [product.id_producto, branchId, initialStock]
                );
                console.log(`  ✅ Creado stock para "${product.nombre}": ${initialStock} unidades`);
            }

            // Create kardex entry for initial stock
            await query(
                `INSERT INTO kardex_inventario (
                    id_producto, id_sucursal, id_tipo_movimiento, 
                    documento_origen, numero_documento, cantidad, 
                    costo_unitario, costo_total, stock_anterior, stock_nuevo, motivo
                ) VALUES (
                    $1, $2, 
                    (SELECT id_tipo_movimiento FROM tipos_movimiento WHERE codigo = 'AJUSTE_ENTRADA'),
                    'AJUSTE', 'STOCK-INICIAL', $3, 0, 0, 0, $3, 'Stock inicial para pruebas POS'
                )`,
                [product.id_producto, branchId, initialStock]
            );
        }

        console.log(`\n✅ Stock agregado a ${products.rows.length} productos`);
        console.log('🎉 Sistema listo para realizar ventas!\n');

    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    }

    process.exit(0);
}

addInitialStock().catch(console.error);
