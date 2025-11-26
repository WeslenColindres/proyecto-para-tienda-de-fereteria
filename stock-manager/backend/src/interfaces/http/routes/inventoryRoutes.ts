import { Router } from 'express';
import type { StoreGateway } from '../../../application/ports/StoreGateway';
import { InventoryController } from '../controllers/InventoryController';

export function buildInventoryRoutes(store: StoreGateway): Router {
  const router = Router();
  const controller = new InventoryController(store);

  router.get('/overview', controller.overview);
  router.get('/detail', controller.overview);
  router.get('/warehouses', controller.overview);

  return router;
}
