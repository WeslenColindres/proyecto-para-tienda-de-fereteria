import { Request, Response } from 'express';
import { WebsocketHub } from '../../realtime/websocketHub';

export class HealthController {
    constructor(private wsHub: WebsocketHub) { }

    check = async (req: Request, res: Response) => {
        const wsStatus = this.wsHub.clientCount >= 0 ? 'active' : 'inactive';

        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            services: {
                websocket: {
                    status: wsStatus,
                    connections: this.wsHub.clientCount
                },
                database: {
                    status: 'connected' // TODO: Add real DB check if needed
                }
            }
        });
    };
}
