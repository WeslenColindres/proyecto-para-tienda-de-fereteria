import { Request, Response } from 'express';

export class WebhookController {
    async handleFelUpdate(req: Request, res: Response) {
        try {
            const payload = req.body;
            console.log('Received FEL Webhook:', payload);
            // Process the webhook payload (e.g., update sale status)
            // This would typically involve a service call.

            res.status(200).json({ message: 'Webhook received' });
        } catch (error: any) {
            console.error('Webhook Error:', error);
            res.status(500).json({ message: 'Error processing webhook' });
        }
    }
}
