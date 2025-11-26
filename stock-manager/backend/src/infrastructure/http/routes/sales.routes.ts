import { Router } from 'express';
import { SalesController } from '../controllers/sales.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();
const salesController = new SalesController();

router.post('/', authenticateToken, salesController.createSale);
router.get('/:id', authenticateToken, salesController.getSaleById);

export default router;
