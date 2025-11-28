import { Router } from 'express';
import { SuppliersController } from '../controllers/suppliers.controller';
import { upload } from '../middlewares/upload.middleware';
import { authenticateToken, authorizeRole } from '../../middleware/auth.middleware';

const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Read routes (Accessible by Admin and Vendedor)
router.get('/', authorizeRole([1, 2]), SuppliersController.list);
router.get('/catalogs', authorizeRole([1, 2]), SuppliersController.catalogs);
router.get('/jobs/:jobId', authorizeRole([1, 2]), SuppliersController.getJobStatus);
router.get('/:id', authorizeRole([1, 2]), SuppliersController.getById);
router.get('/:id/purchases', authorizeRole([1, 2]), SuppliersController.purchases);

// Write routes (Restricted to Admin)
router.post('/', authorizeRole([1]), SuppliersController.create);
router.put('/:id', authorizeRole([1]), SuppliersController.update);
router.delete('/:id', authorizeRole([1]), SuppliersController.delete);
router.post('/:id/restore', authorizeRole([1]), SuppliersController.restore);

// Import/Export (Restricted to Admin)
router.post('/import', authorizeRole([1]), upload.single('file'), SuppliersController.importSuppliers);
router.get('/export', authorizeRole([1]), SuppliersController.exportSuppliers);

// Reports (Restricted to Admin)
router.get('/report', authorizeRole([1]), SuppliersController.report);

export default router;
