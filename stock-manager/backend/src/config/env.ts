import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: process.env.PORT ?? '4000',
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  WEBHOOK_URL: process.env.WEBHOOK_URL,
  DB: {
    HOST: process.env.DB_HOST ?? 'localhost',
    PORT: Number(process.env.DB_PORT ?? 5432),
    NAME: process.env.DB_NAME ?? 'stock_manager',
    USER: process.env.DB_USER ?? 'stock_user',
    PASSWORD: process.env.DB_PASSWORD ?? 'stock_pass',
    SSL: String(process.env.DB_SSL ?? 'false').toLowerCase() === 'true',
    POOL_MIN: Number(process.env.DB_POOL_MIN ?? 2),
    POOL_MAX: Number(process.env.DB_POOL_MAX ?? 20),
  },
  SECURITY: {
    DESKTOP_API_KEY: process.env.DESKTOP_API_KEY ?? '',
    LOCAL_ONLY: String(process.env.LOCAL_ONLY ?? 'true').toLowerCase() === 'true',
    CORS_ALLOWED_ORIGINS:
      process.env.CORS_ALLOWED_ORIGINS?.split(',').map((origin) => origin.trim()).filter(Boolean) ??
      [],
  },
};
