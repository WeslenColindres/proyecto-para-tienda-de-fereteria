import http from 'http';
import express from 'express';
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
import { buildSecurityMiddleware } from './middleware/security';

export function createServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const store = new JsonStoreGateway();
  const realtime = new WebsocketHub(httpServer, env.WEBHOOK_URL);

  app.disable('x-powered-by');
  app.use(buildSecurityMiddleware());
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/products', buildProductRoutes(store, realtime));
  app.use('/api/sales', buildSaleRoutes(store, realtime));
  app.use('/api/dashboard', buildDashboardRoutes(store));
  app.use('/api/categories', buildCategoryRoutes(store));
  app.use('/api/inventory', buildInventoryRoutes(store));
  app.use('/api/suppliers', buildSupplierRoutes(store, realtime));
  app.use('/api/customers', buildCustomerRoutes(store, realtime));

  return { app, httpServer, realtime };
}
