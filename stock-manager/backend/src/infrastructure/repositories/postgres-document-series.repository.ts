import { DocumentSeriesRepository } from '../../domain/ports/document-series.repository';
import { DocumentSeries } from '../../domain/entities/document-series.entity';
import { query } from '../database/postgres';

export class PostgresDocumentSeriesRepository implements DocumentSeriesRepository {
    async findById(id: number): Promise<DocumentSeries | null> {
        const result = await query(
            `SELECT 
        id_serie as id, id_sucursal as "branchId", tipo_documento as "documentType",
        serie, correlativo_actual as "currentCorrelative",
        correlativo_inicio as "startCorrelative", correlativo_fin as "endCorrelative",
        fecha_autorizacion as "authDate", fecha_vencimiento as "expirationDate",
        activa as "isActive", fecha_creacion as "createdAt"
       FROM series_documentos WHERE id_serie = $1`,
            [id]
        );
        if (result.rows.length === 0) return null;
        return new DocumentSeries(result.rows[0]);
    }

    async getActiveSeries(branchId: number, documentType: string): Promise<DocumentSeries | null> {
        const result = await query(
            `SELECT 
        id_serie as id, id_sucursal as "branchId", tipo_documento as "documentType",
        serie, correlativo_actual as "currentCorrelative",
        correlativo_inicio as "startCorrelative", correlativo_fin as "endCorrelative",
        fecha_autorizacion as "authDate", fecha_vencimiento as "expirationDate",
        activa as "isActive", fecha_creacion as "createdAt"
       FROM series_documentos 
       WHERE id_sucursal = $1 
       AND tipo_documento = $2 
       AND activa = true
       AND correlativo_actual < correlativo_fin
       AND (fecha_vencimiento IS NULL OR fecha_vencimiento >= CURRENT_DATE)
       ORDER BY fecha_creacion DESC
       LIMIT 1`,
            [branchId, documentType]
        );
        if (result.rows.length === 0) return null;
        return new DocumentSeries(result.rows[0]);
    }

    async incrementCorrelative(seriesId: number): Promise<void> {
        // Use row-level locking to prevent race conditions
        await query(
            `UPDATE series_documentos 
       SET correlativo_actual = correlativo_actual + 1
       WHERE id_serie = $1 
       AND correlativo_actual < correlativo_fin
       AND activa = true`,
            [seriesId]
        );
    }

    async save(series: DocumentSeries): Promise<DocumentSeries> {
        const result = await query(
            `INSERT INTO series_documentos (
        id_sucursal, tipo_documento, serie, correlativo_actual,
        correlativo_inicio, correlativo_fin, fecha_autorizacion,
        fecha_vencimiento, activa
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id_serie as id`,
            [
                series.props.branchId,
                series.props.documentType,
                series.props.series,
                series.props.currentCorrelative,
                series.props.startCorrelative,
                series.props.endCorrelative,
                series.props.authDate,
                series.props.expirationDate,
                series.props.isActive,
            ]
        );
        return new DocumentSeries({ ...series.props, id: result.rows[0].id });
    }

    async update(series: DocumentSeries): Promise<DocumentSeries> {
        await query(
            `UPDATE series_documentos SET 
        correlativo_actual = $1, activa = $2, fecha_vencimiento = $3
       WHERE id_serie = $4`,
            [
                series.props.currentCorrelative,
                series.props.isActive,
                series.props.expirationDate,
                series.id,
            ]
        );
        return series;
    }
}
