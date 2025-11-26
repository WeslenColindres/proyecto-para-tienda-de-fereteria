import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller';

const router = Router();
const webhookController = new WebhookController();

router.post('/fel-update', webhookController.handleFelUpdate);

export default router;
