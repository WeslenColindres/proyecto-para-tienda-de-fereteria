
import { query } from '../src/infrastructure/database/postgres';

async function checkRepositoryQuery() {
    try {
        console.log('Testing Repository Query...');

        const limit = 10;
        const offset = 0;
        const orderByClause = 'ORDER BY p.id_producto DESC';

        const text = `SELECT 
        p.id_producto as id, p.sku, p.codigo_barras as "barcode", p.nombre as name,
        p.descripcion as description, p.id_categoria as "categoryId",
        p.id_unidad_medida as "unitOfMeasureId", p.id_proveedor_principal as "mainProviderId",
        p.es_inventariable as "isInventoriable", p.es_vendible as "isSellable",
        p.es_comprable as "isBuyable", p.activo as "isActive",
        p.fecha_creacion as "createdAt", p.fecha_modificacion as "updatedAt",
        COALESCE(SUM(sp.cantidad_disponible), 0) as stock,
        COALESCE(MAX(pp.precio), 0) as price
       FROM productos p
       LEFT JOIN stock_producto sp ON p.id_producto = sp.id_producto
       LEFT JOIN precios_producto pp ON p.id_producto = pp.id_producto AND pp.tipo_precio = 'VENTA' AND pp.activo = TRUE
       GROUP BY p.id_producto
       ${orderByClause}
       LIMIT $1 OFFSET $2`;

        console.log('Query:', text);

        const result = await query(text, [limit, offset]);

        console.log(`Query returned ${result.rows.length} rows.`);
        if (result.rows.length > 0) {
            console.log('First row:', JSON.stringify(result.rows[0], null, 2));
        }

    } catch (error) {
        console.error('Error executing query:', error);
    } finally {
        process.exit();
    }
}

checkRepositoryQuery();
