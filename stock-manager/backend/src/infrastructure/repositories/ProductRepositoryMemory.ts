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

  async findByCode(code: string): Promise<Product | null> {
    return this.products.find((p) => p.code === code) ?? null;
  }

  async create(product: Product): Promise<void> {
    this.products.push(product);
  }

  async update(product: Product): Promise<void> {
    const idx = this.products.findIndex((p) => p.id === product.id);
    if (idx >= 0) this.products[idx] = product;
  }

  async deactivate(id: string): Promise<void> {
    const product = this.products.find((p) => p.id === id);
    if (product) product.updateInfo({ active: false });
  }
}

