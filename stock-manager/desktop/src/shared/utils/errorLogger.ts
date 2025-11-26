import { ApiError } from '../api/types';

// Logger para el frontend (permite enviar a backend o solo consola en dev)
export class ErrorLogger {
  static log(error: Error, context?: Record<string, unknown>) {
    const errorData = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      context,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    if (import.meta.env.DEV) {
      // No usamos console.log en prod; solo en dev para depurar
      console.error('[ErrorLogger]', errorData);
    }

    // TODO: Enviar a backend para persistencia de errores de frontend
    // return fetch('/api/logs/frontend', { method: 'POST', body: JSON.stringify(errorData) });
    return errorData;
  }

  static logApiError(error: ApiError, endpoint: string) {
    return this.log(error, {
      type: 'API_ERROR',
      endpoint,
      statusCode: error.status,
      errorCode: error.code,
      data: error.data,
    });
  }
}
