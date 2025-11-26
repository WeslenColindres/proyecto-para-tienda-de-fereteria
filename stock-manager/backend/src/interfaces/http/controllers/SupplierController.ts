import type { Request, Response } from 'express';
import { ListSuppliers } from '../../../application/use-cases/suppliers/ListSuppliers';
import { GetSupplier } from '../../../application/use-cases/suppliers/GetSupplier';
import { CreateSupplier } from '../../../application/use-cases/suppliers/CreateSupplier';
import { UpdateSupplier } from '../../../application/use-cases/suppliers/UpdateSupplier';
import { DeleteSupplier } from '../../../application/use-cases/suppliers/DeleteSupplier';
import { ListSupplierPurchases } from '../../../application/use-cases/suppliers/ListSupplierPurchases';
import { GetSupplierReport } from '../../../application/use-cases/suppliers/GetSupplierReport';
import { GetSupplierCatalogs } from '../../../application/use-cases/suppliers/GetSupplierCatalogs';
import type { StoreGateway } from '../../../application/ports/StoreGateway';
import { DomainError } from '../../../domain/errors/DomainError';
import type { WebsocketHub } from '../../../infrastructure/realtime/websocketHub';

export class SupplierController {
  constructor(private readonly store: StoreGateway, private readonly realtime?: WebsocketHub) {}

  list = async (req: Request, res: Response) => {
    try {
      const useCase = new ListSuppliers(this.store);
      const result = await useCase.execute({
        q: (req.query.q as string) ?? (req.query.search as string),
        status: (req.query.status as any) ?? 'all',
        cityId: (req.query.city as string) ?? (req.query.cityId as string) ?? 'all',
        categoryId: (req.query.category as string) ?? (req.query.categoryId as string) ?? 'all',
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
      });

      res.json({
        ...result,
        data: result.data.map((supplier) => supplier.toJSON()),
      });
    } catch (err) {
      this.handleError(err, res);
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const useCase = new GetSupplier(this.store);
      const supplier = await useCase.execute(req.params.id);
      res.json(supplier.toJSON());
    } catch (err) {
      this.handleError(err, res);
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const useCase = new CreateSupplier(this.store);
      const supplier = await useCase.execute(req.body);
      res.status(201).json(supplier.toJSON());
      this.realtime?.broadcast({ type: 'supplier.created', payload: supplier.toJSON() });
    } catch (err) {
      this.handleError(err, res);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const useCase = new UpdateSupplier(this.store);
      const supplier = await useCase.execute({ ...req.body, id: req.params.id });
      res.json(supplier.toJSON());
      this.realtime?.broadcast({ type: 'supplier.updated', payload: supplier.toJSON() });
    } catch (err) {
      this.handleError(err, res);
    }
  };

  remove = async (req: Request, res: Response) => {
    try {
      const useCase = new DeleteSupplier(this.store);
      const supplier = await useCase.execute(req.params.id);
      res.json(supplier.toJSON());
      this.realtime?.broadcast({ type: 'supplier.deleted', payload: { id: supplier.id } });
    } catch (err) {
      this.handleError(err, res);
    }
  };

  purchases = async (req: Request, res: Response) => {
    try {
      const useCase = new ListSupplierPurchases(this.store);
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const purchases = await useCase.execute(req.params.id, limit);
      res.json(purchases.map((p) => p.toJSON()));
    } catch (err) {
      this.handleError(err, res);
    }
  };

  report = async (req: Request, res: Response) => {
    try {
      const useCase = new GetSupplierReport(this.store);
      const report = await useCase.execute({ from: req.query.from as string, to: req.query.to as string });
      res.json(report);
    } catch (err) {
      this.handleError(err, res);
    }
  };

  catalogs = async (_req: Request, res: Response) => {
    try {
      const useCase = new GetSupplierCatalogs(this.store);
      const catalogs = await useCase.execute();
      res.json(catalogs);
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
