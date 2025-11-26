import { DomainError } from '../../domain/errors/DomainError';
import { Product } from '../../domain/entities/Product';
import type { ProductRepository } from '../../domain/repositories/ProductRepository';
import type { StoreGateway } from '../../application/ports/StoreGateway';

export class ProductStoreRepository implements ProductRepository {
  constructor(private readonly store: StoreGateway) {}

  async findAll(): Promise<Product[]> {
    const data = await this.store.readStore();
    return data.products.map((p) => new Product(p));
  }

  async findById(id: string): Promise<Product | null> {
    const data = await this.store.readStore();
    const found = data.products.find((p) => p.id === id);
    return found ? new Product(found) : null;
  }

  async findByCode(code: string): Promise<Product | null> {
    const data = await this.store.readStore();
    const found = data.products.find((p) => p.code === code);
    return found ? new Product(found) : null;
  }

  async create(product: Product): Promise<void> {
    await this.store.withStoreLock((store) => {
      store.products.push(product.toJSON());
    });
  }

  async update(product: Product): Promise<void> {
    await this.store.withStoreLock((store) => {
      const idx = store.products.findIndex((p) => p.id === product.id);
      if (idx === -1) {
        throw new DomainError('PRODUCT_NOT_FOUND', 'Producto no encontrado', 404);
      }
      store.products[idx] = product.toJSON();
    });
  }

  async deactivate(id: string): Promise<void> {
    await this.store.withStoreLock((store) => {
      const product = store.products.find((p) => p.id === id);
      if (!product) throw new DomainError('PRODUCT_NOT_FOUND', 'Producto no encontrado', 404);
      product.active = false;
    });
  }
}

