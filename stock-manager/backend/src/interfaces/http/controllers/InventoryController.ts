import type { Request, Response } from 'express';
import { GetInventoryReport } from '../../../application/use-cases/inventory/GetInventoryReport';
import type { StoreGateway } from '../../../application/ports/StoreGateway';
import { DomainError } from '../../../domain/errors/DomainError';

export class InventoryController {
  constructor(private readonly store: StoreGateway) {}

  overview = async (_req: Request, res: Response) => {
    try {
      const useCase = new GetInventoryReport(this.store);
      const result = await useCase.execute();
      res.json(result);
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
