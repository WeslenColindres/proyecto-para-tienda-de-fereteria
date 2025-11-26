import { Router } from 'express';
import multer from 'multer';
import type { StoreGateway } from '../../../application/ports/StoreGateway';
import type { WebsocketHub } from '../../../infrastructure/realtime/websocketHub';
import { ProductController } from '../controllers/ProductController';

export function buildProductRoutes(store: StoreGateway, realtime?: WebsocketHub): Router {
  const router = Router();
  const controller = new ProductController(store, realtime);
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

  router.get('/export/template', controller.exportTemplate);
  router.get('/export', controller.exportData);
  router.post('/import', upload.single('file'), controller.importCsv);
  router.get('/', controller.list);
  router.get('/:id/movements', controller.movements);
  router.get('/:id', controller.detail);
  router.post('/', controller.create);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.deactivate);

  return router;
}
