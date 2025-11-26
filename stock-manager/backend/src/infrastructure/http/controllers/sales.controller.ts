import { Request, Response } from 'express';
import { SalesService } from '../../../application/services/sales.service';
import { PostgresSaleRepository } from '../../repositories/postgres-sale.repository';
import { PostgresProductRepository } from '../../repositories/postgres-product.repository';

const saleRepository = new PostgresSaleRepository();
const productRepository = new PostgresProductRepository();
const salesService = new SalesService(saleRepository, productRepository);

export class SalesController {
    async createSale(req: Request, res: Response) {
        try {
            const { items, ...saleData } = req.body;
            const sale = await salesService.createSale(saleData, items);
            res.status(201).json(sale);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async getSaleById(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            const sale = await salesService.getSaleById(id);
            if (!sale) {
                return res.status(404).json({ message: 'Sale not found' });
            }
            res.json(sale);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}
