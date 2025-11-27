import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';
import { authenticateToken, authenticateTokenOptional, authorizeRole } from '../../middleware/auth.middleware';
import multer from 'multer';

const router = Router();
const inventoryController = new InventoryController();
const upload = multer({ dest: 'uploads/' });

// Overview
router.get('/overview', authenticateTokenOptional, inventoryController.getOverview);

// Products
router.get('/products', authenticateTokenOptional, inventoryController.getAllProducts);
router.get('/products/:id', authenticateTokenOptional, inventoryController.getProductById);
router.post('/products', authenticateToken, authorizeRole([1, 3]), inventoryController.createProduct); // Admin, Bodeguero
router.put('/products/:id', authenticateToken, authorizeRole([1, 3]), inventoryController.updateProduct);
router.delete('/products/:id', authenticateToken, authorizeRole([1, 3]), inventoryController.deleteProduct);
router.get('/products/:id/movements', authenticateTokenOptional, inventoryController.getProductMovements);

// Stock
router.get('/products/:productId/stock', authenticateTokenOptional, inventoryController.getStock);
router.post('/products/:productId/stock', authenticateToken, authorizeRole([1, 3]), inventoryController.updateStock);

// Warehouses
router.get('/warehouses', authenticateTokenOptional, inventoryController.getWarehouses);

// Product Suppliers
router.get('/products/:id/suppliers', authenticateTokenOptional, inventoryController.getSuppliers);
router.post('/products/:id/suppliers', authenticateToken, authorizeRole([1, 3]), inventoryController.addSupplier);
router.delete('/products/:id/suppliers/:supplierId', authenticateToken, authorizeRole([1, 3]), inventoryController.removeSupplier);
router.put('/products/:id/suppliers/:supplierId', authenticateToken, authorizeRole([1, 3]), inventoryController.updateSupplierPrice);

// Export/Import
router.get('/products/export', authenticateTokenOptional, inventoryController.exportProducts);
router.get('/products/export/template', authenticateTokenOptional, inventoryController.exportTemplate);
router.post('/products/import', authenticateToken, authorizeRole([1, 3]), upload.single('file'), inventoryController.importProducts);
router.post('/products/import/preview', authenticateToken, authorizeRole([1, 3]), upload.single('file'), (req, res) => inventoryController.previewImport(req, res));
router.post('/products/import/confirm', authenticateToken, authorizeRole([1, 3]), (req, res) => inventoryController.confirmImport(req, res));

export default router;
