import { Router } from 'express';
import type { StoreGateway } from '../../../application/ports/StoreGateway';
import type { WebsocketHub } from '../../../infrastructure/realtime/websocketHub';
import { SaleController } from '../controllers/SaleController';

export function buildSaleRoutes(store: StoreGateway, realtime?: WebsocketHub): Router {
  const router = Router();
  const controller = new SaleController(store, realtime);

  router.get('/', controller.list);
  router.get('/:id', controller.getById);
  router.post('/', controller.create);

  return router;
}

