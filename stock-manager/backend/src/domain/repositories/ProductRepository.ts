import type { Product } from '../entities/Product';

export interface ProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  create(product: Product): Promise<void>;
}
