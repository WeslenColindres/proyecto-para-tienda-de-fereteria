import { Router } from 'express';
import { SalesController } from '../controllers/sales.controller';
import { authenticateToken, authenticateTokenOptional } from '../../middleware/auth.middleware';

const router = Router();
const salesController = new SalesController();

router.post('/', authenticateTokenOptional, salesController.createSale);
router.get('/', authenticateTokenOptional, salesController.getSales);
router.get('/:id', authenticateTokenOptional, salesController.getSaleById);

export default router;
