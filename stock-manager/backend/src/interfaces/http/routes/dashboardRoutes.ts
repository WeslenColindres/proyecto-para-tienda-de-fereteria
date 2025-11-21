import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';

export function buildDashboardRoutes(): Router {
  const router = Router();
  const controller = new DashboardController();

  router.get('/', controller.index);

  return router;
}
