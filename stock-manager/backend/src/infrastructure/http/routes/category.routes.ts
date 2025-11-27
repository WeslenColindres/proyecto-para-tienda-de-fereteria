import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authenticateToken, authenticateTokenOptional } from '../../middleware/auth.middleware';

const router = Router();
const controller = new CategoryController();

router.get('/', authenticateTokenOptional, controller.getAll);
router.post('/', authenticateToken, controller.create);
router.put('/:id', authenticateToken, controller.update);
router.delete('/:id', authenticateToken, controller.delete);

export default router;
