import { Request, Response } from 'express';
import { SalesService } from '../../../application/services/sales.service';
import { ClientService } from '../../../application/services/client.service';
import { PostgresSaleRepository } from '../../repositories/postgres-sale.repository';
import { PostgresSaleDetailRepository } from '../../repositories/postgres-sale-detail.repository';
import { PostgresProductRepository } from '../../repositories/postgres-product.repository';
import { PostgresClientRepository } from '../../repositories/postgres-client.repository';
import { PostgresDocumentSeriesRepository } from '../../repositories/postgres-document-series.repository';

const saleRepository = new PostgresSaleRepository();
const saleDetailRepository = new PostgresSaleDetailRepository();
const productRepository = new PostgresProductRepository();
const clientRepository = new PostgresClientRepository();
const documentSeriesRepository = new PostgresDocumentSeriesRepository();

const clientService = new ClientService(clientRepository);
const salesService = new SalesService(
    saleRepository,
    saleDetailRepository,
    productRepository,
    clientService,
    documentSeriesRepository
);

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

    async getSales(req: Request, res: Response) {
        try {
            const limit = Number(req.query.limit) || 20;
            const page = Number(req.query.page) || 1;
            const offset = (page - 1) * limit;

            const filters = {
                limit,
                offset,
                search: req.query.search,
                status: req.query.status,
                docType: req.query.docType,
                from: req.query.from,
                to: req.query.to
            };

            const result = await salesService.getSales(filters);
            res.json({
                data: result.sales,
                total: result.total,
                page,
                limit
            });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}
