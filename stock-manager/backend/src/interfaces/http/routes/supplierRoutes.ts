import { Router } from 'express';
import type { StoreGateway } from '../../../application/ports/StoreGateway';
import { SupplierController } from '../controllers/SupplierController';
import type { WebsocketHub } from '../../../infrastructure/realtime/websocketHub';

export function buildSupplierRoutes(store: StoreGateway, realtime?: WebsocketHub): Router {
  const router = Router();
  const controller = new SupplierController(store, realtime);

  router.get('/', controller.list);
  router.get('/catalogs', controller.catalogs);
  router.get('/report', controller.report);
  router.get('/:id', controller.getById);
  router.get('/:id/purchases', controller.purchases);
  router.post('/', controller.create);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.remove);

  return router;
}
