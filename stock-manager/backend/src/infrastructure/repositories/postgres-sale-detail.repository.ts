import { SaleDetailRepository } from '../../domain/ports/sale-detail.repository';
import { SaleDetail } from '../../domain/entities/sale-detail.entity';
import { query } from '../database/postgres';

export class PostgresSaleDetailRepository implements SaleDetailRepository {
    async saveAll(saleId: number, details: SaleDetail[]): Promise<SaleDetail[]> {
        const savedDetails: SaleDetail[] = [];

        for (const detail of details) {
            const result = await query(
                `INSERT INTO detalle_ventas (
          id_venta, numero_linea, id_producto, descripcion, cantidad,
          precio_unitario, descuento_porcentaje, descuento_monto,
          subtotal_linea, total_impuestos_linea, total_linea, costo_unitario_momento
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING id_detalle_venta as id`,
                [
                    saleId,
                    detail.props.lineNumber,
                    detail.props.productId,
                    detail.props.description,
                    detail.props.quantity,
                    detail.props.unitPrice,
                    detail.props.discountPercentage,
                    detail.props.discountAmount,
                    detail.props.lineSubtotal,
                    detail.props.lineTaxTotal,
                    detail.props.lineTotal,
                    detail.props.unitCostAtTime,
                ]
            );

            savedDetails.push(
                new SaleDetail({
                    ...detail.props,
                    id: result.rows[0].id,
                    saleId,
                })
            );
        }

        return savedDetails;
    }

    async findBySaleId(saleId: number): Promise<SaleDetail[]> {
        const result = await query(
            `SELECT 
        id_detalle_venta as id, id_venta as "saleId", numero_linea as "lineNumber",
        id_producto as "productId", descripcion as description, cantidad as quantity,
        precio_unitario as "unitPrice", descuento_porcentaje as "discountPercentage",
        descuento_monto as "discountAmount", subtotal_linea as "lineSubtotal",
        total_impuestos_linea as "lineTaxTotal", total_linea as "lineTotal",
        costo_unitario_momento as "unitCostAtTime", fecha_creacion as "createdAt"
       FROM detalle_ventas WHERE id_venta = $1 ORDER BY numero_linea`,
            [saleId]
        );

        return result.rows.map((row) => new SaleDetail(row));
    }
}
