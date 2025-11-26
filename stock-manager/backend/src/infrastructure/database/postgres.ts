import { Pool } from 'pg';
import { logger } from '../logger';
import { env } from '../../config/env';

// Configuración de la conexión a PostgreSQL
console.log('Intentando conectar con:', {
    host: env.DB.HOST,
    port: env.DB.PORT,
    user: env.DB.USER,
    db: env.DB.NAME
});
const pool = new Pool({
    host: env.DB.HOST,
    port: env.DB.PORT,
    database: env.DB.NAME,
    user: env.DB.USER,
    password: env.DB.PASSWORD,
    max: env.DB.POOL_MAX,
    idleTimeoutMillis: 30000, // Cerrar conexiones inactivas después de 30s
    connectionTimeoutMillis: 5000, // Timeout para obtener una conexión del pool (aumentado a 5s)
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
export async function testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
        await pool.query('SELECT NOW()');
        logger.info('Conexión a PostgreSQL exitosa');
        return { success: true };
    } catch (error: any) {
        const errorMessage = error.message || JSON.stringify(error);
        logger.error('Fallo al conectar con PostgreSQL', {
            error: errorMessage,
            fullError: error,
            config: {
                host: env.DB.HOST,
                user: env.DB.USER,
                db: env.DB.NAME,
                port: env.DB.PORT
            }
        });
        return { success: false, error: errorMessage };
    }
}

// Función para cerrar el pool (útil para testing y shutdown)
export async function closePool(): Promise<void> {
    await pool.end();
    logger.info('Pool de PostgreSQL cerrado');
}

export { pool };
