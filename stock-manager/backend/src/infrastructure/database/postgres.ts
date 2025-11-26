import { Pool } from 'pg';
import { logger } from '../logger';

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'stock_manager',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 20, // Máximo de conexiones en el pool
    idleTimeoutMillis: 30000, // Cerrar conexiones inactivas después de 30s
    connectionTimeoutMillis: 2000, // Timeout para obtener una conexión del pool
});

// Evento de error del pool
pool.on('error', (err: Error) => {
    logger.error('Error inesperado en el pool de PostgreSQL', { error: err.message, stack: err.stack });
});

// Evento de conexión exitosa
pool.on('connect', () => {
    logger.info('Nueva conexión establecida con PostgreSQL');
});

// Función helper para ejecutar queries con logging
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;

        logger.debug('Query ejecutado', {
            query: text,
            duration: `${duration}ms`,
            rows: result.rowCount,
        });

        return result.rows as T[];
    } catch (error) {
        logger.error('Error ejecutando query', {
            query: text,
            params,
            error: error instanceof Error ? error.message : String(error),
        });
        throw error;
    }
}

// Función para verificar la conexión
export async function testConnection(): Promise<boolean> {
    try {
        await pool.query('SELECT NOW()');
        logger.info('Conexión a PostgreSQL exitosa');
        return true;
    } catch (error) {
        logger.error('Fallo al conectar con PostgreSQL', {
            error: error instanceof Error ? error.message : String(error),
        });
        return false;
    }
}

// Función para cerrar el pool (útil para testing y shutdown)
export async function closePool(): Promise<void> {
    await pool.end();
    logger.info('Pool de PostgreSQL cerrado');
}

export { pool };
