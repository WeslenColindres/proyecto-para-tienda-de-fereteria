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
        fecha_creacion as "createdAt", fecha_modificacion as "updatedAt"
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
        fecha_creacion as "createdAt", fecha_modificacion as "updatedAt"
       FROM productos WHERE sku = $1`,
            [sku]
        );
        if (result.rows.length === 0) return null;
        return new Product(result.rows[0]);
    }

    async findAll(limit: number = 20, offset: number = 0): Promise<Product[]> {
        const result = await query(
            `SELECT 
        id_producto as id, sku, codigo_barras as "barcode", nombre as name,
        descripcion as description, id_categoria as "categoryId",
        id_unidad_medida as "unitOfMeasureId", id_proveedor_principal as "mainProviderId",
        es_inventariable as "isInventoriable", es_vendible as "isSellable",
        es_comprable as "isBuyable", activo as "isActive",
        fecha_creacion as "createdAt", fecha_modificacion as "updatedAt"
       FROM productos LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
        return result.rows.map((row) => new Product(row));
    }

    async save(product: Product): Promise<Product> {
        const result = await query(
            `INSERT INTO productos (
        sku, codigo_barras, nombre, descripcion, id_categoria, id_unidad_medida,
        id_proveedor_principal, es_inventariable, es_vendible, es_comprable, activo
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id_producto as id`,
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
        activo = $11, fecha_modificacion = CURRENT_TIMESTAMP
       WHERE id_producto = $12`,
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
                product.id,
            ]
        );
        return product;
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
}
