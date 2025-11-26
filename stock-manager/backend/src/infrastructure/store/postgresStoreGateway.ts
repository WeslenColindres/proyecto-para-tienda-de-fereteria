import { pool, query } from '../database/postgres';
import type { StoreGateway, StoreSchema } from '../../application/ports/StoreGateway';
import type { ProductProps } from '../../domain/entities/Product';
import type { CategoryProps } from '../../domain/entities/Category';
import type { WarehouseProps } from '../../domain/entities/Warehouse';
import type { ProductStock } from '../../domain/entities/ProductStock';
import type { CustomerProps } from '../../domain/entities/Customer';
import type { SupplierProps } from '../../domain/entities/Supplier';
import { logger } from '../logger';

export class PostgresStoreGateway implements StoreGateway {
    async readStore(): Promise<StoreSchema> {
        try {
            const [
                productsRes,
                categoriesRes,
                warehousesRes,
                stockRes,
                customersRes,
                suppliersRes
            ] = await Promise.all([
                query('SELECT * FROM productos WHERE activo = true'),
                query('SELECT * FROM categorias WHERE activa = true'),
                query('SELECT * FROM sucursales WHERE activa = true'),
                query('SELECT * FROM stock_producto'),
                query('SELECT * FROM clientes WHERE activo = true'),
                query('SELECT * FROM proveedores WHERE activo = true')
            ]);

            const products: ProductProps[] = productsRes.map(row => ({
                id: String(row.id_producto),
                code: row.sku, // Usamos SKU como código principal
                sku: row.sku,
                barcode: row.codigo_barras,
                name: row.nombre,
                description: row.descripcion,
                categoryId: String(row.id_categoria),
                unitId: String(row.id_unidad_medida),
                supplierId: String(row.id_proveedor_principal),
                price: 0, // Se debe obtener de precios_producto
                cost: 0, // Se debe obtener de historial o compras
                tax: 0, // Se debe obtener de productos_impuestos
                unit: 'unidad', // Placeholder, requeriría join con unidades_medida
                status: row.activo ? 'activo' : 'inactivo',
                stock: 0, // Se calculará del stock
                minStock: 0, // Se debe obtener de configuracion_inventario
                isInventoriable: row.es_inventariable,
                isSellable: row.es_vendible,
                isPurchasable: row.es_comprable,
                active: row.activo,
                createdAt: row.fecha_creacion.toISOString(),
                updatedAt: row.fecha_modificacion.toISOString()
            }));

            const categories: CategoryProps[] = categoriesRes.map(row => ({
                id: String(row.id_categoria),
                code: row.nombre.substring(0, 3).toUpperCase(),
                name: row.nombre,
                description: row.descripcion,
                status: row.activa ? 'activo' : 'inactivo',
                createdAt: row.fecha_creacion.toISOString(),
                updatedAt: row.fecha_modificacion.toISOString()
            }));

            const warehouses: WarehouseProps[] = warehousesRes.map(row => ({
                id: String(row.id_sucursal),
                code: row.codigo_sucursal,
                name: row.nombre,
                createdAt: row.fecha_creacion.toISOString(),
                updatedAt: row.fecha_creacion.toISOString()
            }));

            const productStock: ProductStock[] = stockRes.map(row => ({
                id: String(row.id_stock),
                productId: String(row.id_producto),
                branchId: String(row.id_sucursal),
                warehouseId: String(row.id_sucursal),
                stock: Number(row.cantidad_disponible),
                available: Number(row.cantidad_disponible),
                reserved: Number(row.cantidad_reservada),
                inTransit: Number(row.cantidad_transito),
                lastUpdated: row.fecha_ultima_actualizacion.toISOString(),
                lastMovementAt: row.fecha_ultima_actualizacion.toISOString()
            }));

            // Asignar stock a productos
            products.forEach(p => {
                const pStock = productStock.filter(s => s.productId === p.id);
                p.stock = pStock.reduce((acc, s) => acc + (s.stock ?? 0), 0);
            });

            const customers: CustomerProps[] = customersRes.map(row => ({
                id: String(row.id_cliente),
                nit: row.nit,
                name: row.nombre,
                email: row.email,
                phone: row.telefono,
                city: '', // Falta en tabla clientes directa
                type: 'persona-natural', // Placeholder
                hasCredit: row.limite_credito > 0,
                creditLimit: Number(row.limite_credito),
                creditUsed: 0, // Calcular de ventas pendientes
                discount: 0,
                status: row.activo ? 'activo' : 'inactivo',
                createdAt: row.fecha_registro.toISOString(),
                updatedAt: row.fecha_registro.toISOString()
            }));

            const suppliers: SupplierProps[] = suppliersRes.map(row => ({
                id: String(row.id_proveedor),
                nit: row.nit,
                name: row.nombre,
                contactName: '', // Falta en tabla proveedores directa
                phone: row.telefono,
                email: row.email,
                cityId: '',
                categoryId: '',
                address: row.direccion,
                creditDays: row.dias_entrega,
                creditLimit: 0,
                status: row.activo ? 'activo' : 'inactivo',
                balance: 0,
                overdueDays: 0,
                createdAt: row.fecha_registro.toISOString(),
                updatedAt: row.fecha_registro.toISOString()
            }));

            return {
                products,
                categories,
                warehouses,
                productStock,
                inventoryMovements: [], // TODO: Implementar
                alerts: [], // TODO: Implementar
                auditLogs: [], // TODO: Implementar
                sales: [], // TODO: Implementar
                suppliers,
                supplierPurchases: [], // TODO: Implementar
                supplierCategories: [],
                cities: [],
                customers
            };

        } catch (error) {
            logger.error('Error leyendo store desde PostgreSQL', { error });
            throw error;
        }
    }

    async withStoreLock<T>(fn: (store: StoreSchema) => T | Promise<T>): Promise<T> {
        // En PostgreSQL, el "lock" se maneja con transacciones.
        // Para mantener compatibilidad con la interfaz actual que espera manipular un objeto en memoria,
        // esto es complicado.
        // IDEALMENTE: Refactorizar para no usar withStoreLock y usar transacciones SQL directas en los repositorios.
        // POR AHORA: Simulamos el lock leyendo, ejecutando y (si fuera necesario) guardando, pero
        // como PostgresStoreGateway NO guarda el objeto completo, esta función es peligrosa si se usa para escribir.

        logger.warn('withStoreLock llamado en PostgresStoreGateway - Esto no garantiza atomicidad en DB relacional');
        const store = await this.readStore();
        return fn(store);
    }
}
