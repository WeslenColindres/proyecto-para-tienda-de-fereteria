import { Router } from 'express';
import { SuppliersController } from '../controllers/suppliers.controller';

const router = Router();

router.get('/', SuppliersController.list);
router.post('/', SuppliersController.create);
router.get('/catalogs', SuppliersController.catalogs);
router.get('/:id', SuppliersController.getById);
router.put('/:id', SuppliersController.update);
router.delete('/:id', SuppliersController.delete);
router.get('/:id/purchases', SuppliersController.purchases);

export default router;
