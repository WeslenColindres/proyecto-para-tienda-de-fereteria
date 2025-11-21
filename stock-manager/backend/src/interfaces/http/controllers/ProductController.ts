import type { Request, Response } from 'express';
import { CreateProduct } from '../../../application/use-cases/CreateProduct';
import type { ProductRepository } from '../../../domain/repositories/ProductRepository';

export class ProductController {
  constructor(private productRepo: ProductRepository) {}

  list = async (_req: Request, res: Response) => {
    const products = await this.productRepo.findAll();
    res.json(products.map((p) => p.toJSON()));
  };

  create = async (req: Request, res: Response) => {
    try {
      const { code, name, price, stock } = req.body;
      const useCase = new CreateProduct(this.productRepo);
      const product = await useCase.execute({
        code,
        name,
        price: Number(price),
        stock: Number(stock),
      });

      res.status(201).json(product.toJSON());
    } catch (error: any) {
      res.status(400).json({ error: error.message ?? 'Error al crear producto' });
    }
  };
}
