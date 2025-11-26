import { DomainError } from '../../domain/errors/DomainError';
import { Product, type ProductProps } from '../../domain/entities/Product';
import type { ProductRepository } from '../../domain/repositories/ProductRepository';
import type { StoreGateway } from '../../application/ports/StoreGateway';
import { logger } from '../logger';

export class ProductStoreRepository implements ProductRepository {
  constructor(private readonly store: StoreGateway) {}

  private mapToDomain(raw: any): Product {
    const props: ProductProps = {
      id: raw.id,
      code: raw.code,
      sku: raw.sku ?? raw.code,
      barcode: raw.barcode ?? raw.code,
      name: raw.name,
      description: raw.description,
      categoryId: raw.categoryId,
      unitId: raw.unitId,
      supplierId: raw.supplierId,
      cost: raw.cost ?? 0,
      price: raw.price ?? 0,
      tax: raw.tax ?? 0,
      unit: raw.unit ?? 'unidad',
      status: raw.status ?? (raw.active === false ? 'descontinuado' : 'activo'),
      stock: raw.stock ?? 0,
      minStock: raw.minStock ?? 0,
      isInventoriable: raw.isInventoriable ?? true,
      isSellable: raw.isSellable ?? true,
      isPurchasable: raw.isPurchasable ?? true,
      reorderPoint: raw.reorderPoint ?? raw.minStock,
      maxStock: raw.maxStock,
      physicalLocation: raw.physicalLocation,
      createdAt: raw.createdAt ?? new Date().toISOString(),
      updatedAt: raw.updatedAt ?? raw.createdAt ?? new Date().toISOString(),
      deletedAt: raw.deletedAt,
      createdBy: raw.createdBy,
      updatedBy: raw.updatedBy,
      active: raw.active,
    };
    return new Product(props);
  }

  async findAll(): Promise<Product[]> {
    try {
      const data = await this.store.readStore();
      return data.products.map((p) => this.mapToDomain(p));
    } catch (error) {
      logger.error('ProductStoreRepository.findAll fallo', { error });
      throw error;
    }
  }

  async findById(id: string): Promise<Product | null> {
    try {
      const data = await this.store.readStore();
      const found = data.products.find((p) => p.id === id);
      return found ? this.mapToDomain(found) : null;
    } catch (error) {
      logger.error('ProductStoreRepository.findById fallo', { id, error });
      throw error;
    }
  }

  async findByCode(code: string): Promise<Product | null> {
    try {
      const data = await this.store.readStore();
      const found = data.products.find((p) => p.code === code);
      return found ? this.mapToDomain(found) : null;
    } catch (error) {
      logger.error('ProductStoreRepository.findByCode fallo', { code, error });
      throw error;
    }
  }

  async create(product: Product): Promise<void> {
    try {
      await this.store.withStoreLock((store) => {
        store.products.push(product.toJSON());
      });
    } catch (error) {
      logger.error('ProductStoreRepository.create fallo', { productId: product.id, error });
      throw error;
    }
  }

  async update(product: Product): Promise<void> {
    try {
      await this.store.withStoreLock((store) => {
        const idx = store.products.findIndex((p) => p.id === product.id);
        if (idx === -1) {
          throw new DomainError('PRODUCT_NOT_FOUND', 'Producto no encontrado', 404);
        }
        store.products[idx] = product.toJSON();
      });
    } catch (error) {
      logger.error('ProductStoreRepository.update fallo', { productId: product.id, error });
      throw error;
    }
  }

  async deactivate(id: string): Promise<void> {
    try {
      await this.store.withStoreLock((store) => {
        const product = store.products.find((p) => p.id === id);
        if (!product) throw new DomainError('PRODUCT_NOT_FOUND', 'Producto no encontrado', 404);
        product.active = false;
      });
    } catch (error) {
      logger.error('ProductStoreRepository.deactivate fallo', { productId: id, error });
      throw error;
    }
  }
}
