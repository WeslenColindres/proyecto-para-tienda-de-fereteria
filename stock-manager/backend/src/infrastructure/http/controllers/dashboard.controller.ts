import { Request, Response } from 'express';

export const DashboardController = {
    getStats: async (req: Request, res: Response) => {
        res.json({
            sales: 0,
            purchases: 0,
            inventoryValue: 0,
            lowStock: 0
        });
    }
};
