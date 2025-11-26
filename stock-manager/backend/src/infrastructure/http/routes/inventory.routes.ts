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

export default router;
