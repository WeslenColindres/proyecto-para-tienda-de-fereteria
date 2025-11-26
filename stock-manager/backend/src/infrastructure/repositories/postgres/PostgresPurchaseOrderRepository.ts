import { IPurchaseOrderRepository } from '../../../domain/repositories/IPurchaseOrderRepository';
import { PurchaseOrder } from '../../../domain/entities/PurchaseOrder';
import { Money } from '../../../domain/value-objects/Money';
import { query } from '../../database/postgres';

export class PostgresPurchaseOrderRepository implements IPurchaseOrderRepository {
    async save(order: PurchaseOrder): Promise<void> {
        const data = order.toJSON();

        // 1. Insert Header
        const sqlHeader = `
      INSERT INTO ordenes_compra (
        numero_orden, id_proveedor, id_sucursal, id_usuario_solicitante, 
        fecha_orden, fecha_entrega_esperada, subtotal, total_impuestos, total, 
        estado, observaciones
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      )
      RETURNING id_orden_compra;
    `;

        // Note: We need to handle the case where we are updating an existing order.
        // For simplicity in this iteration, we assume CREATE only or we'd need an UPSERT logic.
        // Given the complexity of updating lines, usually we delete all lines and re-insert or diff them.
        // Here we implement CREATE logic.

        const res = await query(sqlHeader, [
            data.orderNumber,
            parseInt(data.supplierId),
            parseInt(data.branchId),
            parseInt(data.userId),
            data.date,
            data.expectedDeliveryDate,
            data.subtotal,
            0, // tax
            data.total,
            data.status,
            data.notes
        ]);

        const orderId = res[0].id_orden_compra;

        // 2. Insert Details
        for (const [index, item] of data.items.entries()) {
            await query(`
        INSERT INTO detalle_orden_compra (
          id_orden_compra, numero_linea, id_producto, cantidad, precio_unitario, total_linea, cantidad_recibida
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
                orderId,
                index + 1,
                parseInt(item.productId),
                item.quantity,
                item.unitCost,
                item.total,
                0
            ]);
        }
    }

    async findById(id: string): Promise<PurchaseOrder | null> {
        // Implementation pending for read...
        return null;
    }

    async findByOrderNumber(orderNumber: string): Promise<PurchaseOrder | null> {
        // Implementation pending for read...
        return null;
    }
}
