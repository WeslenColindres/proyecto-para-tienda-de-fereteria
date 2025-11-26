import { Router } from 'express';
import type { StoreGateway } from '../../../application/ports/StoreGateway';
import type { WebsocketHub } from '../../../infrastructure/realtime/websocketHub';
import { CustomerController } from '../controllers/CustomerController';

export function buildCustomerRoutes(store: StoreGateway, realtime?: WebsocketHub): Router {
  const router = Router();
  const controller = new CustomerController(store, realtime);

  router.get('/', controller.list);
  router.get('/:id', controller.getById);
  router.post('/', controller.create);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.remove);

  return router;
}
