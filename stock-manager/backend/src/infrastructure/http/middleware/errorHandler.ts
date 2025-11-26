import { Request, Response, NextFunction } from 'express';
import { logger } from '../../logger';

// Error de aplicación para controlar código y status
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Middleware global de manejo de errores con logging estructurado
export function errorHandler(err: Error | AppError, req: Request, res: Response, _next: NextFunction) {
  logger.error('Error en request', {
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: (err as AppError).code,
      details: (err as AppError).details,
    },
    request: {
      method: req.method,
      url: req.url,
      params: req.params,
      query: req.query,
      body: req.body,
      headers: {
        'user-agent': req.headers['user-agent'],
        'x-source-app': req.headers['x-source-app'],
      },
    },
    user: req.headers['x-user-id'],
  });

  const statusCode = (err as AppError).statusCode || 500;
  const code = (err as AppError).code || 'INTERNAL_ERROR';

  res.status(statusCode).json({
    error: code,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: (err as AppError).details,
    }),
  });
}
