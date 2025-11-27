import pool from '../database/postgres';
import { IPurchaseOrderRepository, ListPurchaseOrdersParams, PurchaseOrderListResult, ReceivedItem } from '../../domain/repositories/IPurchaseOrderRepository';
import { PurchaseOrder, PurchaseOrderProps } from '../../domain/entities/PurchaseOrder';
import { Money } from '../../domain/value-objects/Money';

const mapToEntity = (row: any): PurchaseOrder => {
    return new PurchaseOrder({
        id: row.id_orden_compra.toString(),
        orderNumber: row.numero_orden,
        supplierId: row.id_proveedor.toString(),
        branchId: row.id_sucursal.toString(),
        userId: row.id_usuario_solicitante.toString(),
        date: row.fecha_orden,
        expectedDeliveryDate: row.fecha_entrega_esperada,
        actualDeliveryDate: row.fecha_entrega_real,
        status: row.estado,
        items: [], // Loaded separately if needed, or joined
        subtotal: Money.from(parseFloat(row.subtotal)),
        tax: Money.from(parseFloat(row.total_impuestos)),
        total: Money.from(parseFloat(row.total)),
        notes: row.observaciones,
        receivedBy: row.id_usuario_recibe?.toString(),
        receivedAt: row.fecha_recepcion,
        invoiceDocumentUrl: row.url_documento_factura,
        createdAt: row.fecha_creacion
    });
};

export const PurchaseOrdersRepository: IPurchaseOrderRepository = {
    async save(order: PurchaseOrder): Promise<void> {
        const { id, orderNumber, supplierId, branchId, userId, date, expectedDeliveryDate, status, subtotal, tax, total, notes } = order.props;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            let orderId = id;
            if (!id || id === 'new') {
                const result = await client.query(
                    `INSERT INTO ordenes_compra (
                        numero_orden, id_proveedor, id_sucursal, id_usuario_solicitante, 
                        fecha_orden, fecha_entrega_esperada, subtotal, total_impuestos, 
                        total, estado, observaciones
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id_orden_compra`,
                    [orderNumber, supplierId, branchId, userId, date, expectedDeliveryDate, subtotal.amount, tax.amount, total.amount, status, notes]
                );
                orderId = result.rows[0].id_orden_compra;
            } else {
                await client.query(
                    `UPDATE ordenes_compra SET 
                        fecha_entrega_esperada = $1, subtotal = $2, total_impuestos = $3, 
                        total = $4, estado = $5, observaciones = $6
                    WHERE id_orden_compra = $7`,
                    [expectedDeliveryDate, subtotal.amount, tax.amount, total.amount, status, notes, id]
                );
                // Delete existing items to replace
                await client.query('DELETE FROM detalle_orden_compra WHERE id_orden_compra = $1', [id]);
            }

            // Insert items
            let line = 1;
            for (const item of order.props.items) {
                await client.query(
                    `INSERT INTO detalle_orden_compra (
                        id_orden_compra, numero_linea, id_producto, cantidad, 
                        precio_unitario, total_linea, cantidad_recibida
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [orderId, line++, item.productId, item.quantity, item.unitCost.amount, item.total.amount, item.receivedQuantity]
                );
            }

            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    },

    async findById(id: string): Promise<PurchaseOrder | null> {
        const result = await pool.query('SELECT * FROM ordenes_compra WHERE id_orden_compra = $1', [id]);
        if (!result.rows[0]) return null;

        const order = mapToEntity(result.rows[0]);

        const itemsResult = await pool.query(
            'SELECT * FROM detalle_orden_compra WHERE id_orden_compra = $1 ORDER BY numero_linea',
            [id]
        );

        order.props.items = itemsResult.rows.map(row => ({
            productId: row.id_producto.toString(),
            quantity: parseFloat(row.cantidad),
            unitCost: Money.from(parseFloat(row.precio_unitario)),
            total: Money.from(parseFloat(row.total_linea)),
            receivedQuantity: parseFloat(row.cantidad_recibida)
        }));

        return order;
    },

    async findByOrderNumber(orderNumber: string): Promise<PurchaseOrder | null> {
        const result = await pool.query('SELECT * FROM ordenes_compra WHERE numero_orden = $1', [orderNumber]);
        if (!result.rows[0]) return null;
        return this.findById(result.rows[0].id_orden_compra);
    },

    async findAll(params: ListPurchaseOrdersParams): Promise<PurchaseOrderListResult> {
        const page = params.page || 1;
        const pageSize = params.pageSize || 12;
        const offset = (page - 1) * pageSize;

        let whereClause = 'WHERE 1=1';
        const queryParams: any[] = [];
        let paramIndex = 1;

        if (params.search) {
            whereClause += ` AND (numero_orden LIKE $${paramIndex})`;
            queryParams.push(`%${params.search}%`);
            paramIndex++;
        }

        if (params.status) {
            whereClause += ` AND estado = $${paramIndex}`;
            queryParams.push(params.status);
            paramIndex++;
        }

        if (params.supplierId) {
            whereClause += ` AND id_proveedor = $${paramIndex}`;
            queryParams.push(params.supplierId);
            paramIndex++;
        }

        const dataQuery = `
            SELECT * FROM ordenes_compra
            ${whereClause}
            ORDER BY fecha_orden DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        const countQuery = `SELECT COUNT(*) as total FROM ordenes_compra ${whereClause}`;

        const [dataResult, countResult] = await Promise.all([
            pool.query(dataQuery, [...queryParams, pageSize, offset]),
            pool.query(countQuery, queryParams)
        ]);

        return {
            data: dataResult.rows.map(mapToEntity),
            total: parseInt(countResult.rows[0].total),
            page,
            pageSize
        };
    },

    async findBySupplierId(supplierId: string, limit: number = 5): Promise<PurchaseOrder[]> {
        const result = await pool.query(
            'SELECT * FROM ordenes_compra WHERE id_proveedor = $1 ORDER BY fecha_orden DESC LIMIT $2',
            [supplierId, limit]
        );
        return result.rows.map(mapToEntity);
    },

    async updateStatus(id: string, status: string): Promise<void> {
        await pool.query('UPDATE ordenes_compra SET estado = $1 WHERE id_orden_compra = $2', [status, id]);
    },

    async markAsReceived(id: string, userId: string, items: ReceivedItem[]): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Update items received quantity
            for (const item of items) {
                await client.query(
                    'UPDATE detalle_orden_compra SET cantidad_recibida = cantidad_recibida + $1 WHERE id_orden_compra = $2 AND id_producto = $3',
                    [item.quantity, id, item.productId]
                );

                // Update inventory stock (simplified)
                // TODO: Use proper inventory service/repository
                await client.query(
                    'UPDATE stock_producto SET cantidad_disponible = cantidad_disponible + $1 WHERE id_producto = $2',
                    [item.quantity, item.productId]
                );
            }

            // Update order status
            await client.query(
                `UPDATE ordenes_compra SET 
                    estado = 'RECIBIDA', 
                    id_usuario_recibe = $1, 
                    fecha_recepcion = NOW(), 
                    fecha_entrega_real = NOW() 
                WHERE id_orden_compra = $2`,
                [userId, id]
            );

            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }
};
