import pool from '../database/postgres';
import { IAccountsPayableRepository, ListAccountsPayableParams, AccountsPayableListResult, AgingReport } from '../../domain/repositories/IAccountsPayableRepository';
import { AccountsPayable, AccountsPayableProps } from '../../domain/entities/AccountsPayable';
import { Payment } from '../../domain/entities/Payment';

const mapToEntity = (row: any): AccountsPayable => {
    return new AccountsPayable({
        id: row.id_cuenta_por_pagar.toString(),
        purchaseOrderId: row.id_orden_compra?.toString(),
        supplierId: row.id_proveedor.toString(),
        invoiceNumber: row.numero_factura,
        invoiceDate: row.fecha_factura,
        dueDate: row.fecha_vencimiento,
        totalAmount: parseFloat(row.monto_total),
        paidAmount: parseFloat(row.monto_pagado),
        pendingAmount: parseFloat(row.monto_pendiente),
        status: row.estado,
        invoiceDocumentUrl: row.url_documento_factura,
        notes: row.notas,
        createdAt: row.fecha_creacion,
        updatedAt: row.fecha_modificacion
    });
};

export const AccountsPayableRepository: IAccountsPayableRepository = {
    async save(account: AccountsPayable): Promise<void> {
        const { id, purchaseOrderId, supplierId, invoiceNumber, invoiceDate, dueDate, totalAmount, paidAmount, pendingAmount, status, invoiceDocumentUrl, notes } = account.props;

        if (id) {
            await pool.query(
                `UPDATE cuentas_por_pagar SET 
                    numero_factura = $1, fecha_factura = $2, fecha_vencimiento = $3, 
                    monto_total = $4, monto_pagado = $5, monto_pendiente = $6, 
                    estado = $7, url_documento_factura = $8, notas = $9, 
                    fecha_modificacion = NOW()
                WHERE id_cuenta_por_pagar = $10`,
                [invoiceNumber, invoiceDate, dueDate, totalAmount, paidAmount, pendingAmount, status, invoiceDocumentUrl, notes, id]
            );
        } else {
            await pool.query(
                `INSERT INTO cuentas_por_pagar (
                    id_orden_compra, id_proveedor, numero_factura, fecha_factura, 
                    fecha_vencimiento, monto_total, monto_pagado, monto_pendiente, 
                    estado, url_documento_factura, notas
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                [purchaseOrderId, supplierId, invoiceNumber, invoiceDate, dueDate, totalAmount, paidAmount, pendingAmount, status, invoiceDocumentUrl, notes]
            );
        }
    },

    async findById(id: string): Promise<AccountsPayable | null> {
        const result = await pool.query('SELECT * FROM cuentas_por_pagar WHERE id_cuenta_por_pagar = $1', [id]);
        return result.rows[0] ? mapToEntity(result.rows[0]) : null;
    },

    async findAll(params: ListAccountsPayableParams): Promise<AccountsPayableListResult> {
        const page = params.page || 1;
        const pageSize = params.pageSize || 12;
        const offset = (page - 1) * pageSize;

        let whereClause = 'WHERE 1=1';
        const queryParams: any[] = [];
        let paramIndex = 1;

        if (params.supplierId) {
            whereClause += ` AND id_proveedor = $${paramIndex}`;
            queryParams.push(params.supplierId);
            paramIndex++;
        }

        if (params.status) {
            whereClause += ` AND estado = $${paramIndex}`;
            queryParams.push(params.status);
            paramIndex++;
        }

        const dataQuery = `
            SELECT * FROM cuentas_por_pagar
            ${whereClause}
            ORDER BY fecha_vencimiento ASC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        const countQuery = `SELECT COUNT(*) as total FROM cuentas_por_pagar ${whereClause}`;

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

    async findBySupplierId(supplierId: string): Promise<AccountsPayable[]> {
        const result = await pool.query(
            'SELECT * FROM cuentas_por_pagar WHERE id_proveedor = $1 ORDER BY fecha_vencimiento ASC',
            [supplierId]
        );
        return result.rows.map(mapToEntity);
    },

    async findOverdue(): Promise<AccountsPayable[]> {
        const result = await pool.query(
            "SELECT * FROM cuentas_por_pagar WHERE estado = 'pendiente' AND fecha_vencimiento < CURRENT_DATE"
        );
        return result.rows.map(mapToEntity);
    },

    async registerPayment(accountId: string, payment: Payment): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const { amount, paymentDate, paymentMethod, referenceNumber, notes, createdBy } = payment.props;

            // Insert payment record
            await client.query(
                `INSERT INTO pagos_proveedor (
                    id_cuenta_por_pagar, monto, fecha_pago, metodo_pago, 
                    numero_referencia, notas, id_usuario_registro
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [accountId, amount, paymentDate, paymentMethod, referenceNumber, notes, createdBy]
            );

            // Update account payable balance and status
            // This logic is also in the entity, but we need to persist it.
            // We can fetch, update entity, and save, or do it in SQL.
            // Doing it in SQL for atomicity here, but ideally should use entity logic.
            // Let's use SQL for efficiency in this transaction.

            await client.query(
                `UPDATE cuentas_por_pagar 
                 SET monto_pagado = monto_pagado + $1, 
                     monto_pendiente = monto_pendiente - $1,
                     estado = CASE 
                        WHEN monto_pendiente - $1 <= 0 THEN 'paid'
                        ELSE 'partial'
                     END,
                     fecha_modificacion = NOW()
                 WHERE id_cuenta_por_pagar = $2`,
                [amount, accountId]
            );

            // Update supplier balance
            // We need to get the supplier ID first
            const accountRes = await client.query('SELECT id_proveedor FROM cuentas_por_pagar WHERE id_cuenta_por_pagar = $1', [accountId]);
            const supplierId = accountRes.rows[0].id_proveedor;

            await client.query(
                'UPDATE proveedores SET saldo_pendiente = saldo_pendiente - $1 WHERE id_proveedor = $2',
                [amount, supplierId]
            );

            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    },

    async getAgingReport(supplierId?: string): Promise<AgingReport> {
        let whereClause = "WHERE estado IN ('pendiente', 'partial', 'overdue')";
        const queryParams: any[] = [];

        if (supplierId) {
            whereClause += " AND id_proveedor = $1";
            queryParams.push(supplierId);
        }

        const query = `
            SELECT
                COALESCE(SUM(CASE WHEN CURRENT_DATE - fecha_vencimiento <= 30 THEN monto_pendiente ELSE 0 END), 0) as range_0_30,
                COALESCE(SUM(CASE WHEN CURRENT_DATE - fecha_vencimiento > 30 AND CURRENT_DATE - fecha_vencimiento <= 60 THEN monto_pendiente ELSE 0 END), 0) as range_31_60,
                COALESCE(SUM(CASE WHEN CURRENT_DATE - fecha_vencimiento > 60 AND CURRENT_DATE - fecha_vencimiento <= 90 THEN monto_pendiente ELSE 0 END), 0) as range_61_90,
                COALESCE(SUM(CASE WHEN CURRENT_DATE - fecha_vencimiento > 90 THEN monto_pendiente ELSE 0 END), 0) as range_90_plus,
                COALESCE(SUM(monto_pendiente), 0) as total
            FROM cuentas_por_pagar
            ${whereClause}
        `;

        const result = await pool.query(query, queryParams);
        const row = result.rows[0];

        return {
            range_0_30: parseFloat(row.range_0_30),
            range_31_60: parseFloat(row.range_31_60),
            range_61_90: parseFloat(row.range_61_90),
            range_90_plus: parseFloat(row.range_90_plus),
            total: parseFloat(row.total)
        };
    }
};
