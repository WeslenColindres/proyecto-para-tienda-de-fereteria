import { SaleRepository } from '../../domain/ports/sale.repository';
import { Sale } from '../../domain/entities/sale.entity';
import { query } from '../database/postgres';

export class PostgresSaleRepository implements SaleRepository {
    async findById(id: number): Promise<Sale | null> {
        const result = await query(
            `SELECT 
        id_venta as id, uuid_interno as "internalUuid", id_sucursal as "branchId",
        id_serie as "seriesId", numero_documento as "documentNumber",
        tipo_documento as "documentType", id_cliente as "clientId",
        id_direccion_envio as "shippingAddressId", id_usuario_vendedor as "sellerId",
        uuid_sat as "satUuid", numero_autorizacion_sat as "satAuthNumber",
        serie_sat as "satSeries", numero_sat as "satNumber",
        fecha_certificacion as "certificationDate", subtotal,
        total_descuentos as "totalDiscounts", total_impuestos as "totalTaxes",
        total_final as "finalTotal", estado as status,
        requiere_certificacion as "requiresCertification",
        intentos_certificacion as "certificationAttempts",
        error_certificacion as "certificationError", observaciones as observations,
        fecha_venta as "saleDate", fecha_vencimiento as "dueDate",
        fecha_anulacion as "cancellationDate", motivo_anulacion as "cancellationReason",
        id_usuario_anula as "cancelledByUserId", fecha_creacion as "createdAt",
        fecha_modificacion as "updatedAt"
       FROM ventas WHERE id_venta = $1`,
            [id]
        );
        if (result.rows.length === 0) return null;
        return new Sale(result.rows[0]);
    }

    async findByDocumentNumber(documentNumber: string): Promise<Sale | null> {
        const result = await query(
            `SELECT 
        id_venta as id, uuid_interno as "internalUuid", id_sucursal as "branchId",
        id_serie as "seriesId", numero_documento as "documentNumber",
        tipo_documento as "documentType", id_cliente as "clientId",
        id_direccion_envio as "shippingAddressId", id_usuario_vendedor as "sellerId",
        uuid_sat as "satUuid", numero_autorizacion_sat as "satAuthNumber",
        serie_sat as "satSeries", numero_sat as "satNumber",
        fecha_certificacion as "certificationDate", subtotal,
        total_descuentos as "totalDiscounts", total_impuestos as "totalTaxes",
        total_final as "finalTotal", estado as status,
        requiere_certificacion as "requiresCertification",
        intentos_certificacion as "certificationAttempts",
        error_certificacion as "certificationError", observaciones as observations,
        fecha_venta as "saleDate", fecha_vencimiento as "dueDate",
        fecha_anulacion as "cancellationDate", motivo_anulacion as "cancellationReason",
        id_usuario_anula as "cancelledByUserId", fecha_creacion as "createdAt",
        fecha_modificacion as "updatedAt"
       FROM ventas WHERE numero_documento = $1`,
            [documentNumber]
        );
        if (result.rows.length === 0) return null;
        return new Sale(result.rows[0]);
    }

    async save(sale: Sale): Promise<Sale> {
        const result = await query(
            `INSERT INTO ventas (
        id_sucursal, id_serie, numero_documento, tipo_documento, id_cliente,
        id_direccion_envio, id_usuario_vendedor, subtotal, total_descuentos,
        total_impuestos, total_final, estado, requiere_certificacion,
        observaciones, fecha_venta, fecha_vencimiento
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING id_venta as id, uuid_interno as "internalUuid"`,
            [
                sale.props.branchId,
                sale.props.seriesId,
                sale.documentNumber,
                sale.props.documentType,
                sale.props.clientId,
                sale.props.shippingAddressId,
                sale.props.sellerId,
                sale.props.subtotal,
                sale.props.totalDiscounts,
                sale.props.totalTaxes,
                sale.finalTotal,
                sale.props.status,
                sale.props.requiresCertification,
                sale.props.observations,
                sale.props.saleDate,
                sale.props.dueDate,
            ]
        );
        return new Sale({
            ...sale.props,
            id: result.rows[0].id,
            internalUuid: result.rows[0].internalUuid,
        });
    }

    async update(sale: Sale): Promise<Sale> {
        await query(
            `UPDATE ventas SET 
        uuid_sat = $1, numero_autorizacion_sat = $2, serie_sat = $3, numero_sat = $4,
        fecha_certificacion = $5, estado = $6, intentos_certificacion = $7,
        error_certificacion = $8, fecha_anulacion = $9, motivo_anulacion = $10,
        id_usuario_anula = $11, fecha_modificacion = CURRENT_TIMESTAMP
       WHERE id_venta = $12`,
            [
                sale.props.satUuid,
                sale.props.satAuthNumber,
                sale.props.satSeries,
                sale.props.satNumber,
                sale.props.certificationDate,
                sale.props.status,
                sale.props.certificationAttempts,
                sale.props.certificationError,
                sale.props.cancellationDate,
                sale.props.cancellationReason,
                sale.props.cancelledByUserId,
                sale.id,
            ]
        );
        return sale;
    }

    async findAll(params: any): Promise<{ sales: Sale[], total: number }> {
        const limit = params.limit || 20;
        const offset = params.offset || 0;

        const whereClauses: string[] = [];
        const queryParams: any[] = [];
        let paramIndex = 1;

        if (params.search) {
            whereClauses.push(`(numero_documento ILIKE $${paramIndex} OR uuid_sat ILIKE $${paramIndex})`);
            queryParams.push(`%${params.search}%`);
            paramIndex++;
        }

        if (params.status && params.status !== 'all') {
            whereClauses.push(`estado = $${paramIndex}`);
            queryParams.push(params.status);
            paramIndex++;
        }

        if (params.docType && params.docType !== 'all') {
            whereClauses.push(`tipo_documento = $${paramIndex}`);
            queryParams.push(params.docType);
            paramIndex++;
        }

        if (params.from) {
            whereClauses.push(`fecha_venta >= $${paramIndex}`);
            queryParams.push(params.from);
            paramIndex++;
        }

        if (params.to) {
            whereClauses.push(`fecha_venta <= $${paramIndex}`);
            queryParams.push(params.to);
            paramIndex++;
        }

        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        // Count
        const countRes = await query(`SELECT COUNT(*) as total FROM ventas ${whereSql}`, queryParams);
        const total = Number(countRes.rows[0].total);

        // Data
        const result = await query(
            `SELECT 
        id_venta as id, uuid_interno as "internalUuid", id_sucursal as "branchId",
        id_serie as "seriesId", numero_documento as "documentNumber",
        tipo_documento as "documentType", id_cliente as "clientId",
        id_direccion_envio as "shippingAddressId", id_usuario_vendedor as "sellerId",
        uuid_sat as "satUuid", numero_autorizacion_sat as "satAuthNumber",
        serie_sat as "satSeries", numero_sat as "satNumber",
        fecha_certificacion as "certificationDate", subtotal,
        total_descuentos as "totalDiscounts", total_impuestos as "totalTaxes",
        total_final as "finalTotal", estado as status,
        requiere_certificacion as "requiresCertification",
        intentos_certificacion as "certificationAttempts",
        error_certificacion as "certificationError", observaciones as observations,
        fecha_venta as "saleDate", fecha_vencimiento as "dueDate",
        fecha_anulacion as "cancellationDate", motivo_anulacion as "cancellationReason",
        id_usuario_anula as "cancelledByUserId", fecha_creacion as "createdAt",
        fecha_modificacion as "updatedAt"
       FROM ventas
       ${whereSql}
       ORDER BY fecha_venta DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
            [...queryParams, limit, offset]
        );

        const sales = result.rows.map(row => new Sale(row));
        return { sales, total };
    }
}
