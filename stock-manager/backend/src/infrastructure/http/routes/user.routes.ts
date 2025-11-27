import { Router } from 'express';
import { UserController } from '../controllers/UserController';

const router = Router();
const controller = new UserController();

router.post('/register', controller.registerUser);
router.post('/assign-role', controller.assignRole);
router.get('/:userId/permissions', controller.getUserPermissions);

export default router;
