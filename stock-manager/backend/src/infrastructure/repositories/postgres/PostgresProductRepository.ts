import { IProductRepository } from '../../../domain/repositories/IProductRepository';
import { Product, ProductProps } from '../../../domain/entities/Product';
import { SKU } from '../../../domain/value-objects/SKU';
import { query } from '../../database/postgres';

export class PostgresProductRepository implements IProductRepository {
    async save(product: Product): Promise<void> {
        const data = product.toJSON();
        const sql = `
      INSERT INTO productos (
        id_producto, sku, codigo_barras, nombre, descripcion, 
        id_categoria, id_unidad_medida, id_proveedor_principal, 
        es_inventariable, es_vendible, es_comprable, activo, 
        fecha_creacion, fecha_modificacion
      ) VALUES (
        DEFAULT, $1, $2, $3, $4, 
        $5, $6, $7, 
        $8, $9, $10, $11, 
        NOW(), NOW()
      )
      ON CONFLICT (sku) DO UPDATE SET
        nombre = EXCLUDED.nombre,
        descripcion = EXCLUDED.descripcion,
        codigo_barras = EXCLUDED.codigo_barras,
        fecha_modificacion = NOW()
      RETURNING id_producto;
    `;

        // Note: This is a simplified mapping. In a real scenario, we'd need to handle
        // foreign keys (category, unit, supplier) more carefully, possibly resolving UUIDs to IDs if needed
        // or ensuring the IDs passed are valid DB IDs.
        // For this implementation, we assume the IDs in ProductProps are valid.

        // We also need to handle the 'id' mapping. The domain uses UUID (string), DB uses Serial (number).
        // Ideally, we should change DB to use UUID or map it here.
        // Given the init.sql uses SERIAL for id_producto, we might need to store the UUID in a separate column 
        // or change the schema to use UUID as primary key.
        // Looking at init.sql, 'sku' is unique, so we can use it for lookups.

        // ADJUSTMENT: The init.sql has 'sku' as VARCHAR(50) UNIQUE.
        // We will map domain 'code' to 'sku'.

        await query(sql, [
            data.code,
            data.barcode,
            data.name,
            data.description,
            data.categoryId ? parseInt(data.categoryId) : null, // Assuming categoryId is number in DB
            null, // unitId
            null, // supplierId
            true, // isInventoriable
            true, // isSellable
            true, // isPurchasable
            data.status === 'activo'
        ]);
    }

    async findBySku(sku: SKU): Promise<Product | null> {
        const rows = await query('SELECT * FROM productos WHERE sku = $1', [sku.toString()]);
        if (rows.length === 0) return null;
        return this.mapRowToProduct(rows[0]);
    }

    async findById(id: string): Promise<Product | null> {
        // Assuming id is the DB ID (number) passed as string
        const rows = await query('SELECT * FROM productos WHERE id_producto = $1', [parseInt(id)]);
        if (rows.length === 0) return null;
        return this.mapRowToProduct(rows[0]);
    }

    async findAll(filters?: any): Promise<Product[]> {
        const rows = await query('SELECT * FROM productos WHERE activo = true LIMIT 100');
        return rows.map(row => this.mapRowToProduct(row));
    }

    async count(): Promise<number> {
        const rows = await query('SELECT COUNT(*) as total FROM productos');
        return parseInt(rows[0].total);
    }

    async delete(id: string): Promise<void> {
        await query('UPDATE productos SET activo = false WHERE id_producto = $1', [parseInt(id)]);
    }

    async saveBulk(products: Product[]): Promise<void> {
        // Implement batch insert using pg-promise or constructing a large query
        // For simplicity, we loop (not optimal for huge sets, but improved later)
        for (const p of products) {
            await this.save(p);
        }
    }

    private mapRowToProduct(row: any): Product {
        return new Product({
            id: String(row.id_producto),
            code: row.sku,
            sku: row.sku,
            name: row.nombre,
            description: row.descripcion,
            categoryId: String(row.id_categoria),
            barcode: row.codigo_barras,
            price: 0, // Fetch from prices table
            cost: 0,
            tax: 0,
            unit: 'unidad',
            stock: 0, // Fetch from stock table
            minStock: 0,
            status: row.activo ? 'activo' : 'inactivo',
            createdAt: row.fecha_creacion,
            updatedAt: row.fecha_modificacion
        });
    }
}
