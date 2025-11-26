import { Request, Response } from 'express';

export const SuppliersController = {
    list: async (req: Request, res: Response) => {
        // Mock response for now
        res.json({
            data: [],
            total: 0,
            page: 1,
            pageSize: 10,
            counters: { activo: 0, inactivo: 0, moroso: 0 }
        });
    },

    getById: async (req: Request, res: Response) => {
        res.status(404).json({ message: 'Supplier not found' });
    },

    create: async (req: Request, res: Response) => {
        res.status(201).json(req.body);
    },

    update: async (req: Request, res: Response) => {
        res.json(req.body);
    },

    delete: async (req: Request, res: Response) => {
        res.json({ success: true });
    },

    catalogs: async (req: Request, res: Response) => {
        res.json({ cities: [], categories: [] });
    },

    purchases: async (req: Request, res: Response) => {
        res.json([]);
    }
};
