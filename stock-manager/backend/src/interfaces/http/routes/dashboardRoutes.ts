import { Router } from 'express';
import type { StoreGateway } from '../../../application/ports/StoreGateway';
import { DashboardController } from '../controllers/DashboardController';

export function buildDashboardRoutes(store: StoreGateway): Router {
  const router = Router();
  const controller = new DashboardController(store);

  router.get('/', controller.index);

  return router;
}

