import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';
import { authenticateToken, authorizeRole } from '../../middleware/auth.middleware';

const router = Router();
const inventoryController = new InventoryController();

router.get('/products', authenticateToken, inventoryController.getAllProducts);
router.get('/products/:id', authenticateToken, inventoryController.getProductById);
router.post('/products', authenticateToken, authorizeRole([1, 3]), inventoryController.createProduct); // Admin, Bodeguero
router.put('/products/:id', authenticateToken, authorizeRole([1, 3]), inventoryController.updateProduct);
router.get('/products/:productId/stock', authenticateToken, inventoryController.getStock);
router.post('/products/:productId/stock', authenticateToken, authorizeRole([1, 3]), inventoryController.updateStock);

// Product Suppliers
router.get('/products/:id/suppliers', authenticateToken, inventoryController.getSuppliers);
router.post('/products/:id/suppliers', authenticateToken, authorizeRole([1, 3]), inventoryController.addSupplier);
router.delete('/products/:id/suppliers/:supplierId', authenticateToken, authorizeRole([1, 3]), inventoryController.removeSupplier);
router.put('/products/:id/suppliers/:supplierId', authenticateToken, authorizeRole([1, 3]), inventoryController.updateSupplierPrice);

// Product Import
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });

router.post('/products/import/preview', authenticateToken, authorizeRole([1, 3]), upload.single('file'), (req, res) => inventoryController.previewImport(req, res));
router.post('/products/import/confirm', authenticateToken, authorizeRole([1, 3]), (req, res) => inventoryController.confirmImport(req, res));

export default router;
