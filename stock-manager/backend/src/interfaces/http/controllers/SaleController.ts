import type { Request, Response } from 'express';
import { CreateSaleWithStock } from '../../../application/use-cases/sales/CreateSaleWithStock';
import { GetSale } from '../../../application/use-cases/sales/GetSale';
import { ListSales } from '../../../application/use-cases/sales/ListSales';
import type { StoreGateway } from '../../../application/ports/StoreGateway';
import { DomainError } from '../../../domain/errors/DomainError';
import type { WebsocketHub } from '../../../infrastructure/realtime/websocketHub';

export class SaleController {
  constructor(private readonly store: StoreGateway, private readonly realtime?: WebsocketHub) {}

  list = async (req: Request, res: Response) => {
    try {
      const useCase = new ListSales(this.store);
      const result = await useCase.execute({
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
        docType: req.query.docType as any,
        status: req.query.status as any,
        search: req.query.search as string | undefined,
        returnsOnly: req.query.returnsOnly === 'true',
        from: req.query.from as string | undefined,
        to: req.query.to as string | undefined,
      });

      res.json({
        ...result,
        data: result.data.map((sale) => sale.toJSON()),
      });
    } catch (err) {
      this.handleError(err, res);
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const useCase = new GetSale(this.store);
      const sale = await useCase.execute(req.params.id);
      res.json(sale);
    } catch (err) {
      this.handleError(err, res);
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const useCase = new CreateSaleWithStock(this.store);
      const sale = await useCase.execute(req.body);
      res.status(201).json(sale.toJSON());

      if (this.realtime) {
        this.realtime.broadcast({ type: 'sale.created', payload: sale.toJSON() });
        const store = await this.store.readStore();
        const updated = store.products
          .filter((p) => sale.toJSON().items.some((item) => item.productId === p.id))
          .map((p) => ({ id: p.id, stock: p.stock }));
        this.realtime.broadcast({ type: 'inventory.updated', payload: updated });
        const alerts = store.alerts.filter((a) => sale.toJSON().items.some((item) => item.productId === a.productId));
        if (alerts.length) {
          this.realtime.broadcast({ type: 'alert.created', payload: alerts });
        }
      }
    } catch (err) {
      this.handleError(err, res);
    }
  };

  private handleError(err: unknown, res: Response) {
    if (err instanceof DomainError) {
      return res.status(err.status).json({ error: err.code, message: err.message });
    }
    console.error(err);
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Error interno del servidor' });
  }
}
