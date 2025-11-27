import { ReportRepository } from '../../domain/ports/ReportRepository';

import { Report, ReportProps } from '../../domain/entities/Report';
import { query } from '../database/postgres';

export class PostgresReportRepository implements ReportRepository {

  async findAllReports(): Promise<Report[]> {
    const result = await query(`
      SELECT 
        id_reporte_generado as id, nombre_archivo as name, descripcion as description,
        id_tipo_reporte as type, formato as format, parametros_utilizados as parameters,
        estado as status, ruta_servidor as "filePath", tamano_bytes as "fileSize",
        id_usuario_genera as "generatedByUserId", mensaje_error as "errorMessage",
        fecha_generacion as "createdAt", fecha_generacion as "completedAt"
      FROM reportes_generados
      ORDER BY fecha_generacion DESC
    `);
    return result.rows.map(row => new Report(row as ReportProps));
  }

  async findReportsByUserId(userId: number): Promise<Report[]> {
    const result = await query(`
      SELECT 
        id_reporte_generado as id, nombre_archivo as name, descripcion as description,
        id_tipo_reporte as type, formato as format, parametros_utilizados as parameters,
        estado as status, ruta_servidor as "filePath", tamano_bytes as "fileSize",
        id_usuario_genera as "generatedByUserId", mensaje_error as "errorMessage",
        fecha_generacion as "createdAt", fecha_generacion as "completedAt"
      FROM reportes_generados
      WHERE id_usuario_genera = $1
      ORDER BY fecha_generacion DESC
    `, [userId]);
    return result.rows.map(row => new Report(row as ReportProps));
  }

  async findReportById(id: number): Promise<Report | null> {
    const result = await query(`
      SELECT 
        id_reporte_generado as id, nombre_archivo as name, descripcion as description,
        id_tipo_reporte as type, formato as format, parametros_utilizados as parameters,
        estado as status, ruta_servidor as "filePath", tamano_bytes as "fileSize",
        id_usuario_genera as "generatedByUserId", mensaje_error as "errorMessage",
        fecha_generacion as "createdAt", fecha_generacion as "completedAt"
      FROM reportes_generados WHERE id_reporte_generado = $1
    `, [id]);

    if (result.rows.length === 0) return null;
    return new Report(result.rows[0] as ReportProps);
  }

  async createReport(report: Report): Promise<Report> {
    const result = await query(`
      INSERT INTO reportes_generados (
        nombre_archivo, descripcion, id_tipo_reporte, formato, parametros_utilizados,
        estado, id_usuario_genera, url_archivo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, '')
      RETURNING id_reporte_generado as id, fecha_generacion as "createdAt"
    `, [
      report.name, report.props.description, report.props.type ? parseInt(report.props.type as string) : null, // Assuming type is ID now based on FK
      report.props.format, report.props.parameters, report.status,
      report.props.generatedByUserId
    ]);

    const newProps = { ...report.props, ...result.rows[0] };
    return new Report(newProps);
  }

  async updateReport(report: Report): Promise<Report> {
    const result = await query(`
      UPDATE reportes_generados SET
        estado = $1, ruta_servidor = $2, tamano_bytes = $3,
        mensaje_error = $4
      WHERE id_reporte_generado = $5
      RETURNING id_reporte_generado
    `, [
      report.status, report.props.filePath, report.props.fileSize,
      report.props.errorMessage, report.id
    ]);

    return report;
  }
}
