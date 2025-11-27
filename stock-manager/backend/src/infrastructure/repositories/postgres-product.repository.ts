import { ProductRepository } from '../../domain/ports/product.repository';
import { Product } from '../../domain/entities/product.entity';
import { Stock } from '../../domain/entities/stock.entity';
import { query } from '../database/postgres';

export class PostgresProductRepository implements ProductRepository {
    async findById(id: number): Promise<Product | null> {
        const result = await query(
            `SELECT 
        id_producto as id, sku, codigo_barras as "barcode", nombre as name,
        descripcion as description, id_categoria as "categoryId",
        id_unidad_medida as "unitOfMeasureId", id_proveedor_principal as "mainProviderId",
        es_inventariable as "isInventoriable", es_vendible as "isSellable",
        es_comprable as "isBuyable", activo as "isActive",
        fecha_creacion as "createdAt", fecha_modificacion as "updatedAt",
        imagen_url as "imageUrl"
       FROM productos WHERE id_producto = $1`,
            [id]
        );
        if (result.rows.length === 0) return null;
        return new Product(result.rows[0]);
    }

    async findBySku(sku: string): Promise<Product | null> {
        const result = await query(
            `SELECT 
        id_producto as id, sku, codigo_barras as "barcode", nombre as name,
        descripcion as description, id_categoria as "categoryId",
        id_unidad_medida as "unitOfMeasureId", id_proveedor_principal as "mainProviderId",
        es_inventariable as "isInventoriable", es_vendible as "isSellable",
        es_comprable as "isBuyable", activo as "isActive",
        fecha_creacion as "createdAt", fecha_modificacion as "updatedAt",
        imagen_url as "imageUrl"
       FROM productos WHERE sku = $1`,
            [sku]
        );
        if (result.rows.length === 0) return null;
        return new Product(result.rows[0]);
    }

    async findAll(limit: number = 20, offset: number = 0, orderBy: string = 'id_producto', orderDir: 'ASC' | 'DESC' = 'DESC', filters: any = {}): Promise<{ products: Product[], total: number }> {
        const validColumns = ['id_producto', 'nombre', 'sku', 'stock', 'precio'];
        const sortCol = validColumns.includes(orderBy) ? orderBy : 'id_producto';

        let orderByClause = `ORDER BY ${sortCol} ${orderDir}`;
        if (sortCol === 'id_producto') orderByClause = `ORDER BY p.id_producto ${orderDir}`;
        if (sortCol === 'stock') orderByClause = `ORDER BY stock ${orderDir}`;
        if (sortCol === 'precio') orderByClause = `ORDER BY price ${orderDir}`;

        const whereClauses: string[] = ['p.activo = TRUE'];
        const params: any[] = [];
        let paramIndex = 1;

        if (filters.search) {
            whereClauses.push(`(p.nombre ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex} OR p.codigo_barras ILIKE $${paramIndex})`);
            params.push(`%${filters.search}%`);
            paramIndex++;
        }

        if (filters.categoryId && filters.categoryId !== 'all') {
            whereClauses.push(`p.id_categoria = $${paramIndex}`);
            params.push(filters.categoryId);
            paramIndex++;
        }

        if (filters.status && filters.status !== 'all') {
            // Assuming status is mapped to active/inactive for now, or we need a status column
            // The entity has 'activo' boolean.
            if (filters.status === 'activo') whereClauses.push(`p.activo = TRUE`);
            if (filters.status === 'inactivo') whereClauses.push(`p.activo = FALSE`);
        }

        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        // Get total count
        const countResult = await query(
            `SELECT COUNT(*) as total FROM productos p ${whereSql}`,
            params
        );
        const total = Number(countResult.rows[0].total);

        // Get data
        const result = await query(
            `SELECT 
        p.id_producto as id, p.sku, p.codigo_barras as "barcode", p.nombre as name,
        p.descripcion as description, p.id_categoria as "categoryId",
        c.nombre as "categoryName",
        p.id_unidad_medida as "unitOfMeasureId", p.id_proveedor_principal as "mainProviderId",
        p.es_inventariable as "isInventoriable", p.es_vendible as "isSellable",
        p.es_comprable as "isBuyable", p.activo as "isActive",
        p.fecha_creacion as "createdAt", p.fecha_modificacion as "updatedAt",
        p.imagen_url as "imageUrl",
        COALESCE(SUM(sp.cantidad_disponible), 0) as stock,
        COALESCE(MAX(pp.precio), 0) as price
       FROM productos p
       LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
       LEFT JOIN stock_producto sp ON p.id_producto = sp.id_producto
       LEFT JOIN precios_producto pp ON p.id_producto = pp.id_producto AND pp.tipo_precio = 'VENTA' AND pp.activo = TRUE
       ${whereSql}
       GROUP BY p.id_producto, c.nombre
       ${orderByClause}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
            [...params, limit, offset]
        );

        const products = result.rows.map((row) => new Product({
            ...row,
            stock: Number(row.stock),
            price: Number(row.price)
        }));

        return { products, total };
    }

    async save(product: Product): Promise<Product> {
        const result = await query(
            `INSERT INTO productos (
        sku, codigo_barras, nombre, descripcion, id_categoria, id_unidad_medida,
        id_proveedor_principal, es_inventariable, es_vendible, es_comprable, activo, imagen_url
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id_producto as id`,
            [
                product.sku,
                product.props.barcode,
                product.name,
                product.props.description,
                product.props.categoryId,
                product.props.unitOfMeasureId,
                product.props.mainProviderId,
                product.isInventoriable,
                product.props.isSellable,
                product.props.isBuyable,
                product.props.isActive,
                product.props.imageUrl
            ]
        );
        return new Product({ ...product.props, id: result.rows[0].id });
    }

    async update(product: Product): Promise<Product> {
        await query(
            `UPDATE productos SET 
        sku = $1, codigo_barras = $2, nombre = $3, descripcion = $4,
        id_categoria = $5, id_unidad_medida = $6, id_proveedor_principal = $7,
        es_inventariable = $8, es_vendible = $9, es_comprable = $10,
        activo = $11, imagen_url = $12, fecha_modificacion = CURRENT_TIMESTAMP
       WHERE id_producto = $13`,
            [
                product.sku,
                product.props.barcode,
                product.name,
                product.props.description,
                product.props.categoryId,
                product.props.unitOfMeasureId,
                product.props.mainProviderId,
                product.isInventoriable,
                product.props.isSellable,
                product.props.isBuyable,
                product.props.isActive,
                product.props.imageUrl,
                product.id,
            ]
        );
        return product;
    }

    async updatePrice(productId: number, price: number): Promise<void> {
        await query(
            `UPDATE precios_producto SET activo = FALSE WHERE id_producto = $1 AND tipo_precio = 'VENTA'`,
            [productId]
        );
        await query(
            `INSERT INTO precios_producto (id_producto, tipo_precio, precio, fecha_vigencia_inicio, activo)
             VALUES ($1, 'VENTA', $2, CURRENT_DATE, TRUE)
             ON CONFLICT (id_producto, tipo_precio, fecha_vigencia_inicio)
             DO UPDATE SET precio = $2, activo = TRUE`,
            [productId, price]
        );
    }

    async delete(id: number): Promise<void> {
        await query(
            `UPDATE productos SET activo = FALSE, fecha_modificacion = CURRENT_TIMESTAMP WHERE id_producto = $1`,
            [id]
        );
    }

    async getStock(productId: number, branchId: number): Promise<Stock | null> {
        const result = await query(
            `SELECT 
        id_stock as id, id_producto as "productId", id_sucursal as "branchId",
        cantidad_disponible as "quantityAvailable", cantidad_reservada as "quantityReserved",
        cantidad_transito as "quantityInTransit", fecha_ultima_actualizacion as "lastUpdatedAt"
       FROM stock_producto WHERE id_producto = $1 AND id_sucursal = $2`,
            [productId, branchId]
        );
        if (result.rows.length === 0) return null;
        return new Stock(result.rows[0]);
    }

    async updateStock(stock: Stock): Promise<Stock> {
        const result = await query(
            `INSERT INTO stock_producto (
        id_producto, id_sucursal, cantidad_disponible, cantidad_reservada, cantidad_transito
       ) VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id_producto, id_sucursal) DO UPDATE SET
        cantidad_disponible = EXCLUDED.cantidad_disponible,
        cantidad_reservada = EXCLUDED.cantidad_reservada,
        cantidad_transito = EXCLUDED.cantidad_transito,
        fecha_ultima_actualizacion = CURRENT_TIMESTAMP
       RETURNING id_stock as id`,
            [
                stock.props.productId,
                stock.props.branchId,
                stock.quantityAvailable,
                stock.props.quantityReserved,
                stock.props.quantityInTransit,
            ]
        );
        return new Stock({ ...stock.props, id: result.rows[0].id });
    }

    async addSupplier(productId: number, supplierId: number, cost: number, code?: string, isMain: boolean = false): Promise<void> {
        if (isMain) {
            // Si este es el principal, desmarcar otros
            await query(
                `UPDATE productos_proveedores SET es_proveedor_principal = FALSE WHERE id_producto = $1`,
                [productId]
            );
            // También actualizar el proveedor principal en la tabla de productos
            await query(
                `UPDATE productos SET id_proveedor_principal = $1 WHERE id_producto = $2`,
                [supplierId, productId]
            );
        }

        await query(
            `INSERT INTO productos_proveedores (
                id_producto, id_proveedor, precio_costo, codigo_producto_proveedor, es_proveedor_principal
            ) VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (id_producto, id_proveedor) DO UPDATE SET
                precio_costo = EXCLUDED.precio_costo,
                codigo_producto_proveedor = COALESCE(EXCLUDED.codigo_producto_proveedor, productos_proveedores.codigo_producto_proveedor),
                es_proveedor_principal = EXCLUDED.es_proveedor_principal,
                fecha_actualizacion = CURRENT_TIMESTAMP`,
            [productId, supplierId, cost, code, isMain]
        );
    }

    async removeSupplier(productId: number, supplierId: number): Promise<void> {
        await query(
            `DELETE FROM productos_proveedores WHERE id_producto = $1 AND id_proveedor = $2`,
            [productId, supplierId]
        );
    }

    async getSuppliers(productId: number): Promise<any[]> {
        const result = await query(
            `SELECT 
                pp.id_producto as "productId",
                pp.id_proveedor as "supplierId",
                p.nombre as "supplierName",
                pp.codigo_producto_proveedor as "supplierProductCode",
                pp.precio_costo as "costPrice",
                pp.moneda as "currency",
                pp.es_proveedor_principal as "isMainSupplier",
                pp.fecha_ultima_compra as "lastPurchaseDate"
            FROM productos_proveedores pp
            JOIN proveedores p ON pp.id_proveedor = p.id_proveedor
            WHERE pp.id_producto = $1
            ORDER BY pp.es_proveedor_principal DESC, p.nombre ASC`,
            [productId]
        );
        return result.rows;
    }

    async updateSupplierPrice(productId: number, supplierId: number, cost: number): Promise<void> {
        await query(
            `UPDATE productos_proveedores 
            SET precio_costo = $1, fecha_actualizacion = CURRENT_TIMESTAMP 
            WHERE id_producto = $2 AND id_proveedor = $3`,
            [cost, productId, supplierId]
        );
    }

    async getWarehouses(): Promise<any[]> {
        const result = await query(
            `SELECT 
                id_sucursal as id,
                nombre as name,
                direccion as address
            FROM sucursales 
            WHERE activa = TRUE`
        );
        return result.rows;
    }

    async createMovement(data: {
        productId: number;
        branchId: number;
        type: string;
        quantity: number;
        stockBefore: number;
        stockAfter: number;
        userId: number;
        reason: string;
        reference: string;
        documentType: string;
    }): Promise<void> {
        // First get the movement type ID
        const typeResult = await query(
            `SELECT id_tipo_movimiento FROM tipos_movimiento WHERE codigo = $1`,
            [data.type]
        );

        let typeId = typeResult.rows[0]?.id_tipo_movimiento;

        // Fallback if specific type not found
        if (!typeId) {
            const fallbackType = data.type.includes('ENTRADA') ? 'AJUSTE_ENTRADA' : 'AJUSTE_SALIDA';
            const fallbackResult = await query(
                `SELECT id_tipo_movimiento FROM tipos_movimiento WHERE codigo = $1`,
                [fallbackType]
            );
            typeId = fallbackResult.rows[0]?.id_tipo_movimiento;
        }

        await query(
            `INSERT INTO kardex_inventario (
                id_producto, id_sucursal, id_tipo_movimiento,
                cantidad, stock_anterior, stock_nuevo,
                id_usuario, motivo, documento_origen, numero_documento,
                fecha_movimiento
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)`,
            [
                data.productId,
                data.branchId,
                typeId,
                data.quantity,
                data.stockBefore,
                data.stockAfter,
                data.userId,
                data.reason,
                data.documentType,
                data.reference
            ]
        );
    }

    async getMovements(productId: number, limit: number, offset: number): Promise<{ movements: any[], total: number }> {
        // Get total
        const countRes = await query(
            `SELECT COUNT(*) as total FROM kardex_inventario WHERE id_producto = $1`,
            [productId]
        );
        const total = Number(countRes.rows[0].total);

        // Get data
        const result = await query(
            `SELECT 
            k.id_movimiento as id,
            k.fecha_movimiento as date,
            tm.nombre as type,
            k.cantidad as quantity,
            k.stock_anterior as "stockBefore",
            k.stock_nuevo as "stockAfter",
            k.motivo as reason,
            k.numero_documento as reference,
            u.nombre_completo as user
        FROM kardex_inventario k
        JOIN tipos_movimiento tm ON k.id_tipo_movimiento = tm.id_tipo_movimiento
        LEFT JOIN usuarios u ON k.id_usuario = u.id_usuario
        WHERE k.id_producto = $1
        ORDER BY k.fecha_movimiento DESC
        LIMIT $2 OFFSET $3`,
            [productId, limit, offset]
        );

        return {
            movements: result.rows,
            total
        };
    }

    async getInventoryStats(): Promise<{ value: number; productsWithStock: number; lowStock: number }> {
        const result = await query(
            `SELECT
                COALESCE(SUM(sp.cantidad_disponible * pp.precio), 0) as value,
                COUNT(DISTINCT CASE WHEN sp.cantidad_disponible > 0 THEN p.id_producto END) as "productsWithStock",
                COUNT(DISTINCT CASE WHEN sp.cantidad_disponible <= ci.stock_minimo THEN p.id_producto END) as "lowStock"
            FROM productos p
            LEFT JOIN stock_producto sp ON p.id_producto = sp.id_producto
            LEFT JOIN precios_producto pp ON p.id_producto = pp.id_producto AND pp.tipo_precio = 'VENTA' AND pp.activo = TRUE
            LEFT JOIN configuracion_inventario ci ON p.id_producto = ci.id_producto AND sp.id_sucursal = ci.id_sucursal
            WHERE p.activo = TRUE`
        );
        return {
            value: Number(result.rows[0].value),
            productsWithStock: Number(result.rows[0].productsWithStock),
            lowStock: Number(result.rows[0].lowStock)
        };
    }

    async getWarehouseStats(): Promise<any[]> {
        const result = await query(
            `SELECT
                s.nombre as warehouse,
                COUNT(DISTINCT sp.id_producto) as products,
                COALESCE(SUM(sp.cantidad_disponible * pp.precio), 0) as value,
                0 as percentage, -- Calculated in service
                100 as capacity -- Placeholder
            FROM sucursales s
            LEFT JOIN stock_producto sp ON s.id_sucursal = sp.id_sucursal
            LEFT JOIN precios_producto pp ON sp.id_producto = pp.id_producto AND pp.tipo_precio = 'VENTA' AND pp.activo = TRUE
            WHERE s.activa = TRUE
            GROUP BY s.id_sucursal, s.nombre`
        );
        return result.rows;
    }

    async getLowStockAlerts(): Promise<any[]> {
        const result = await query(
            `SELECT
                'STOCK_BAJO' as type,
                CASE WHEN sp.cantidad_disponible <= 0 THEN 'critical' ELSE 'warning' END as level,
                'Stock bajo para ' || p.nombre as message,
                p.nombre as "productId", -- Using name for display
                CURRENT_TIMESTAMP as "createdAt"
            FROM productos p
            JOIN stock_producto sp ON p.id_producto = sp.id_producto
            LEFT JOIN configuracion_inventario ci ON p.id_producto = ci.id_producto AND sp.id_sucursal = ci.id_sucursal
            WHERE p.activo = TRUE
            AND sp.cantidad_disponible <= COALESCE(ci.stock_minimo, 5)
            LIMIT 10`
        );
        return result.rows;
    }
}
