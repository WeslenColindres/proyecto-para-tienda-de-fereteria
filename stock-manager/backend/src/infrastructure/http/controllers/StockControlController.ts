import { Request, Response } from 'express';
import { StockControlService } from '../../../application/services/StockControlService';
import { PostgresInventoryRepository } from '../../repositories/PostgresInventoryRepository';

const inventoryRepo = new PostgresInventoryRepository();
const stockService = new StockControlService(inventoryRepo);

export class StockControlController {
    async addBatch(req: Request, res: Response) {
        try {
            const batch = await stockService.addBatch(req.body);
            res.status(201).json(batch);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async getProductBatches(req: Request, res: Response) {
        try {
            const productId = Number(req.params.productId);
            const batches = await stockService.getProductBatches(productId);
            res.json(batches);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async updatePrice(req: Request, res: Response) {
        try {
            const history = await stockService.updatePrice(req.body);
            res.status(201).json(history);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async getPriceHistory(req: Request, res: Response) {
        try {
            const productId = Number(req.params.productId);
            const history = await stockService.getPriceHistory(productId);
            res.json(history);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}
