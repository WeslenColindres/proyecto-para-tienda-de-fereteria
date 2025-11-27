import { query } from '../database/postgres';
import { ReportingRepository } from '../../domain/ports/ReportingRepository';

export class PostgresReportingRepository implements ReportingRepository {
    async getSalesSummary(startDate?: Date, endDate?: Date): Promise<any[]> {
        let queryStr = 'SELECT * FROM vista_resumen_ventas_diarias';
        const params: any[] = [];

        if (startDate && endDate) {
            queryStr += ' WHERE fecha BETWEEN $1 AND $2';
            params.push(startDate, endDate);
        }

        queryStr += ' ORDER BY fecha DESC';

        const result = await query(queryStr, params);
        return result.rows;
    }

    async getInventoryValuation(): Promise<any[]> {
        const queryStr = 'SELECT * FROM vista_inventario_valorizado';
        const result = await query(queryStr);
        return result.rows;
    }

    async getTopProducts(limit: number = 10): Promise<any[]> {
        const queryStr = 'SELECT * FROM vista_productos_mas_vendidos LIMIT $1';
        const result = await query(queryStr, [limit]);
        return result.rows;
    }

    async getAccountsReceivable(): Promise<any[]> {
        const queryStr = 'SELECT * FROM vista_cuentas_por_cobrar';
        const result = await query(queryStr);
        return result.rows;
    }

    async getFinancialSummary(year: number, month: number): Promise<any[]> {
        const queryStr = 'SELECT * FROM vista_estado_resultados';
        const result = await query(queryStr);
        return result.rows;
    }

    async getInventoryMovements(limit: number = 100): Promise<any[]> {
        const queryStr = 'SELECT * FROM vista_movimientos_inventario_recientes LIMIT $1';
        const result = await query(queryStr, [limit]);
        return result.rows;
    }
}
