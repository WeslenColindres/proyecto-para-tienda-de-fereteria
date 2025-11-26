import { query } from '../database/postgres';

export interface Job {
    id: number;
    type: string;
    status: 'PENDIENTE' | 'PROCESANDO' | 'COMPLETADO' | 'FALLIDO';
    payload: any;
    result?: any;
    progress: number;
    error?: string;
    createdAt: Date;
}

export class PostgresJobQueue {
    async createJob(type: string, payload: any): Promise<Job> {
        const rows = await query(
            'INSERT INTO jobs (tipo, payload) VALUES ($1, $2) RETURNING *',
            [type, JSON.stringify(payload)]
        );
        return this.mapRowToJob(rows[0]);
    }

    async getNextPendingJob(): Promise<Job | null> {
        // Simple implementation: fetch first pending. 
        // In production, use SELECT ... FOR UPDATE SKIP LOCKED to avoid race conditions with multiple workers.
        const rows = await query(
            "SELECT * FROM jobs WHERE estado = 'PENDIENTE' ORDER BY fecha_creacion ASC LIMIT 1"
        );
        if (rows.length === 0) return null;
        return this.mapRowToJob(rows[0]);
    }

    async updateProgress(id: number, progress: number, status?: string): Promise<void> {
        let sql = 'UPDATE jobs SET progreso = $2';
        const params: any[] = [id, progress];

        if (status) {
            sql += ', estado = $3';
            params.push(status);
            if (status === 'PROCESANDO') {
                sql += ', fecha_inicio = NOW()';
            }
        }

        sql += ' WHERE id_job = $1';
        await query(sql, params);
    }

    async completeJob(id: number, result: any): Promise<void> {
        await query(
            "UPDATE jobs SET estado = 'COMPLETADO', resultado = $2, fecha_fin = NOW(), progreso = 100 WHERE id_job = $1",
            [id, JSON.stringify(result)]
        );
    }

    async failJob(id: number, error: string): Promise<void> {
        await query(
            "UPDATE jobs SET estado = 'FALLIDO', mensaje_error = $2, fecha_fin = NOW() WHERE id_job = $1",
            [id, error]
        );
    }

    private mapRowToJob(row: any): Job {
        return {
            id: row.id_job,
            type: row.tipo,
            status: row.estado,
            payload: row.payload,
            result: row.resultado,
            progress: row.progreso,
            error: row.mensaje_error,
            createdAt: row.fecha_creacion
        };
    }
}
