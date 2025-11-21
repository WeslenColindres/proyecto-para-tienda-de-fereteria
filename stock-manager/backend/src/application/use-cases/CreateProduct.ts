import { randomUUID } from 'crypto';
import { Product } from '../../domain/entities/Product';
import type { ProductRepository } from '../../domain/repositories/ProductRepository';

interface CreateProductInput {
  code: string;
  name: string;
  price: number;
  stock: number;
}

export class CreateProduct {
  constructor(private productRepo: ProductRepository) {}

  async execute(input: CreateProductInput) {
    const product = new Product({
      id: randomUUID(),
      code: input.code,
      name: input.name,
      price: input.price,
      stock: input.stock,
    });

    await this.productRepo.create(product);

    return product;
  }
}
