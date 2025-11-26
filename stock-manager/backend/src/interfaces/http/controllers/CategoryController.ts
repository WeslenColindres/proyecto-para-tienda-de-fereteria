import type { Request, Response } from 'express';
import { DeleteCategory } from '../../../application/use-cases/categories/DeleteCategory';
import { ListCategories } from '../../../application/use-cases/categories/ListCategories';
import { UpsertCategory } from '../../../application/use-cases/categories/UpsertCategory';
import type { StoreGateway } from '../../../application/ports/StoreGateway';
import { DomainError } from '../../../domain/errors/DomainError';

export class CategoryController {
  constructor(private readonly store: StoreGateway) {}

  list = async (req: Request, res: Response) => {
    try {
      const useCase = new ListCategories(this.store);
      const data = await useCase.execute(req.query.includeInactive === 'true');
      res.json(data);
    } catch (err) {
      this.handleError(err, res);
    }
  };

  upsert = async (req: Request, res: Response) => {
    try {
      const useCase = new UpsertCategory(this.store);
      const category = await useCase.execute({ id: req.params.id, ...req.body });
      res.json(category);
    } catch (err) {
      this.handleError(err, res);
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const useCase = new DeleteCategory(this.store);
      const category = await useCase.execute(req.params.id);
      res.json(category);
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
