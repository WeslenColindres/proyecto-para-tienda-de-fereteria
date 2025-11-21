import type { Product } from '../../domain/entities/Product';
import type { ProductRepository } from '../../domain/repositories/ProductRepository';

export class ProductRepositoryMemory implements ProductRepository {
  private products: Product[] = [];

  async findAll(): Promise<Product[]> {
    return this.products;
  }

  async findById(id: string): Promise<Product | null> {
    return this.products.find((p) => p.id === id) ?? null;
  }

  async create(product: Product): Promise<void> {
    this.products.push(product);
  }
}
