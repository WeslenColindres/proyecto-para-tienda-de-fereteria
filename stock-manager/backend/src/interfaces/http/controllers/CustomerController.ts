import type { Request, Response } from 'express';
import { ListCustomers } from '../../../application/use-cases/customers/ListCustomers';
import { GetCustomer } from '../../../application/use-cases/customers/GetCustomer';
import { CreateCustomer } from '../../../application/use-cases/customers/CreateCustomer';
import { UpdateCustomer } from '../../../application/use-cases/customers/UpdateCustomer';
import { DeleteCustomer } from '../../../application/use-cases/customers/DeleteCustomer';
import type { StoreGateway } from '../../../application/ports/StoreGateway';
import type { WebsocketHub } from '../../../infrastructure/realtime/websocketHub';
import { DomainError } from '../../../domain/errors/DomainError';

export class CustomerController {
  constructor(private readonly store: StoreGateway, private readonly realtime?: WebsocketHub) {}

  list = async (req: Request, res: Response) => {
    try {
      const useCase = new ListCustomers(this.store);
      const result = await useCase.execute({
        q: (req.query.q as string) ?? (req.query.search as string),
        status: (req.query.status as any) ?? 'all',
        city: (req.query.city as string) ?? 'all',
        type: (req.query.type as any) ?? 'all',
        credit: (req.query.credit as any) ?? 'all',
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
      });
      res.json({ ...result, data: result.data.map((c) => c.toJSON()) });
    } catch (err) {
      this.handleError(err, res);
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const useCase = new GetCustomer(this.store);
      const customer = await useCase.execute(req.params.id);
      res.json(customer.toJSON());
    } catch (err) {
      this.handleError(err, res);
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const useCase = new CreateCustomer(this.store);
      const customer = await useCase.execute(req.body);
      res.status(201).json(customer.toJSON());
      this.realtime?.broadcast({ type: 'customer.created', payload: customer.toJSON() });
    } catch (err) {
      this.handleError(err, res);
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const useCase = new UpdateCustomer(this.store);
      const customer = await useCase.execute({ ...req.body, id: req.params.id });
      res.json(customer.toJSON());
      this.realtime?.broadcast({ type: 'customer.updated', payload: customer.toJSON() });
    } catch (err) {
      this.handleError(err, res);
    }
  };

  remove = async (req: Request, res: Response) => {
    try {
      const useCase = new DeleteCustomer(this.store);
      const customer = await useCase.execute(req.params.id);
      res.json(customer.toJSON());
      this.realtime?.broadcast({ type: 'customer.deleted', payload: { id: customer.id } });
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
