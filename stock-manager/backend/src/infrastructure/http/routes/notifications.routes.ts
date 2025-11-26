import { Router } from 'express';
import { NotificationsController } from '../controllers/notifications.controller';

const router = Router();

router.get('/', NotificationsController.list);
router.patch('/:id/read', NotificationsController.markAsRead);
router.delete('/:id', NotificationsController.delete);

export default router;
