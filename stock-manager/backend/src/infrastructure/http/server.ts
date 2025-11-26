import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { JsonStoreGateway } from '../store/jsonStoreGateway';
import { WebsocketHub } from '../realtime/websocketHub';
import { buildProductRoutes } from '../../interfaces/http/routes/productRoutes';
import { buildSaleRoutes } from '../../interfaces/http/routes/saleRoutes';
import { buildDashboardRoutes } from '../../interfaces/http/routes/dashboardRoutes';
import { buildCategoryRoutes } from '../../interfaces/http/routes/categoryRoutes';
import { buildInventoryRoutes } from '../../interfaces/http/routes/inventoryRoutes';
import { buildSupplierRoutes } from '../../interfaces/http/routes/supplierRoutes';
import { buildCustomerRoutes } from '../../interfaces/http/routes/customerRoutes';
import { env } from '../../config/env';
import { logger, stream } from '../logger';
import { buildSecurityMiddleware } from './middleware/security';

export function createServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const store = new JsonStoreGateway();
  const realtime = new WebsocketHub(httpServer, env.WEBHOOK_URL);

  // --- SEGURIDAD Y LOGS ---

  // 1. Logging de solicitudes HTTP con Morgan y Winston
  app.use(morgan('combined', { stream }));

  // 2. Helmet para cabeceras de seguridad HTTP (protección contra XSS, etc.)
  app.use(helmet());

  // 2.1 Middleware de seguridad base (existente)
  app.use(buildSecurityMiddleware());

  // 3. CORS: Restringir orígenes permitidos
  // Permitimos localhost:5173 (Vite/Electron en dev) y null (Electron en prod a veces usa file://)
  app.use(cors({
    origin: ['http://localhost:5173', 'file://', 'null'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Source-App'],
    credentials: true
  }));

  // 4. Middleware de "Circuito Cerrado": Verificar que la petición viene de nuestra App Desktop
  app.use((req, res, next) => {
    const sourceApp = req.headers['x-source-app'];

    // Permitir solicitudes de health check sin el header (opcional, pero útil para monitoreo básico)
    if (req.path === '/health') return next();

    if (sourceApp !== 'stock-manager-desktop') {
      logger.warn(`Acceso denegado: Intento de acceso sin cabecera de origen válida. IP: ${req.ip}`);
      return res.status(403).json({
        error: 'Acceso Denegado',
        message: 'Esta API solo es accesible desde la aplicación de escritorio oficial.'
      });
    }
    next();
  });

  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', system: 'stock-manager-backend' });
  });

  // --- RUTAS ---
  app.use('/api/products', buildProductRoutes(store, realtime));
  app.use('/api/sales', buildSaleRoutes(store, realtime));
  app.use('/api/dashboard', buildDashboardRoutes(store));
  app.use('/api/categories', buildCategoryRoutes(store));
  app.use('/api/inventory', buildInventoryRoutes(store));
  app.use('/api/suppliers', buildSupplierRoutes(store, realtime));
  app.use('/api/customers', buildCustomerRoutes(store, realtime));

  return { app, httpServer, realtime };
}
