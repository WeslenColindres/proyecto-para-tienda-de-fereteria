import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/profile', authenticateToken, authController.getProfile);

export default router;
