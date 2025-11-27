import { Router } from 'express';
import { SuppliersController } from '../controllers/suppliers.controller';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

router.get('/', SuppliersController.list);
router.get('/catalogs', SuppliersController.catalogs);
router.get('/export', SuppliersController.exportSuppliers);
router.get('/jobs/:jobId', SuppliersController.getJobStatus);
router.get('/:id', SuppliersController.getById);
router.post('/', SuppliersController.create);
router.put('/:id', SuppliersController.update);
router.delete('/:id', SuppliersController.delete);
router.post('/:id/restore', SuppliersController.restore);
router.post('/import', upload.single('file'), SuppliersController.importSuppliers);
router.get('/:id/purchases', SuppliersController.purchases);

export default router;
