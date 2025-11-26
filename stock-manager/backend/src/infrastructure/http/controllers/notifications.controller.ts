import { Request, Response } from 'express';

export const NotificationsController = {
    list: async (req: Request, res: Response) => {
        res.json({
            data: [],
            unreadCount: 0
        });
    },

    markAsRead: async (req: Request, res: Response) => {
        res.json({ success: true });
    },

    delete: async (req: Request, res: Response) => {
        res.json({ success: true });
    }
};
