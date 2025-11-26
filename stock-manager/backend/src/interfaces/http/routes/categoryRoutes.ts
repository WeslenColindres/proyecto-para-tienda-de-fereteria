import { Router } from 'express';
import type { StoreGateway } from '../../../application/ports/StoreGateway';
import { CategoryController } from '../controllers/CategoryController';

export function buildCategoryRoutes(store: StoreGateway): Router {
  const router = Router();
  const controller = new CategoryController(store);

  router.get('/', controller.list);
  router.post('/', controller.upsert);
  router.put('/:id', controller.upsert);
  router.delete('/:id', controller.delete);

  return router;
}
