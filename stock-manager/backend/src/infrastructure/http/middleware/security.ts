import cors from 'cors';
import helmet from 'helmet';
import type { RequestHandler } from 'express';
import { env } from '../../../config/env';

const localIps = new Set(['127.0.0.1', '::1']);

const isLocalIp = (ip: string | undefined) => {
  if (!ip) return false;
  if (localIps.has(ip)) return true;
  return ip.startsWith('::ffff:127.0.0.');
};

export function buildSecurityMiddleware() {
  const corsMiddleware = cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // electron/file:// or same-origin
      if (env.SECURITY.CORS_ALLOWED_ORIGINS.length === 0) return callback(null, false);
      if (env.SECURITY.CORS_ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    optionsSuccessStatus: 200,
  });

  const apiKeyGuard: RequestHandler = (req, res, next) => {
    const configuredKey = env.SECURITY.DESKTOP_API_KEY;
    if (!configuredKey) return next(); // no guard configured
    const headerKey = req.get('x-desktop-api-key');
    if (headerKey !== configuredKey) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    return next();
  };

  const localOnlyGuard: RequestHandler = (req, res, next) => {
    if (!env.SECURITY.LOCAL_ONLY) return next();
    if (isLocalIp(req.ip)) return next();
    return res.status(403).json({ error: 'forbidden' });
  };

  return [
    helmet({ contentSecurityPolicy: false }),
    corsMiddleware,
    apiKeyGuard,
    localOnlyGuard,
  ];
}
