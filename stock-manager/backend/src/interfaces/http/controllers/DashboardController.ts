import type { Request, Response } from 'express';
import { GetDashboardMetrics } from '../../../application/use-cases/GetDashboardMetrics';

export class DashboardController {
  constructor(private readonly getDashboardMetrics = new GetDashboardMetrics()) {}

  index = async (_req: Request, res: Response) => {
    const payload = await this.getDashboardMetrics.execute();
    res.json(payload);
  };
}
