import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { logger } from '../logger';

// Rate limiter para creación de notificaciones
export const notificationRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 10, // máximo 10 notificaciones por minuto
    message: {
        success: false,
        error: 'Too many notifications created. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
        logger.warn('Notification rate limit exceeded', {
            ip: req.ip,
            path: req.path,
        });
        res.status(429).json({
            success: false,
            error: 'Too many notifications created. Please try again later.',
        });
    },
    skip: (req: Request) => {
        // No aplicar rate limit en desarrollo
        return process.env.NODE_ENV === 'development';
    },
});
