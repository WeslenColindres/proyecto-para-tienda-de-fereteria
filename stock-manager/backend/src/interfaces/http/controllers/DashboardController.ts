import type { Request, Response } from 'express';
import { GetDashboardMetrics } from '../../../application/use-cases/GetDashboardMetrics';
import type { StoreGateway } from '../../../application/ports/StoreGateway';

export class DashboardController {
  constructor(private readonly store: StoreGateway) {}

  index = async (_req: Request, res: Response) => {
    const useCase = new GetDashboardMetrics(this.store);
    const payload = await useCase.execute();
    res.json(payload);
  };
}

