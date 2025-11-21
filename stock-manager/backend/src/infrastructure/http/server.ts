import cors from 'cors';
import express from 'express';
import { buildProductRoutes } from '../../interfaces/http/routes/productRoutes';
import { buildDashboardRoutes } from '../../interfaces/http/routes/dashboardRoutes';
import { ProductRepositoryMemory } from '../repositories/ProductRepositoryMemory';

export function createServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  const productRepo = new ProductRepositoryMemory();

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/products', buildProductRoutes(productRepo));
  app.use('/api/dashboard', buildDashboardRoutes());

  return app;
}
