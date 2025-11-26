import winston from 'winston';
import path from 'path';

// Definir niveles de log personalizados si es necesario, pero los de npm son suficientes
// error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6

// Formato de log para consola (coloreado y simple)
const consoleFormat = winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

// Formato de log para archivo (JSON estructurado para fácil análisis)
const fileFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
);

// Crear la instancia del logger
export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels: winston.config.npm.levels,
    transports: [
        // Escribir todos los logs con nivel 'error' o inferior a 'error.log'
        new winston.transports.File({
            filename: path.join('logs', 'error.log'),
            level: 'error',
            format: fileFormat,
        }),
        // Escribir todos los logs a 'combined.log'
        new winston.transports.File({
            filename: path.join('logs', 'combined.log'),
            format: fileFormat,
        }),
    ],
});

// Si no estamos en producción, también loguear a la consola con el formato simple
if (process.env.NODE_ENV !== 'production') {
    logger.add(
        new winston.transports.Console({
            format: consoleFormat,
        })
    );
}

// Función helper para loguear streams (útil para morgan)
export const stream = {
    write: (message: string) => {
        logger.http(message.trim());
    },
};
