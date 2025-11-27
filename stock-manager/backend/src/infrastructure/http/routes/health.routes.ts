import { Router } from 'express';
import { HealthController } from '../controllers/healthController';
import { WebsocketHub } from '../../realtime/websocketHub';

export const createHealthRoutes = (wsHub: WebsocketHub) => {
    const router = Router();
    const controller = new HealthController(wsHub);

    router.get('/', controller.check);

    return router;
};
