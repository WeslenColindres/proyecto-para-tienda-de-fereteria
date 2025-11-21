import { Router } from 'express';
import type { ProductRepository } from '../../../domain/repositories/ProductRepository';
import { ProductController } from '../controllers/ProductController';

export function buildProductRoutes(productRepo: ProductRepository): Router {
  const router = Router();
  const controller = new ProductController(productRepo);

  router.get('/', controller.list);
  router.post('/', controller.create);

  return router;
}
