import { DomainError } from '../../../domain/errors/DomainError';
import type { StoreGateway } from '../../ports/StoreGateway';
import { pushAuditLog } from '../../utils/audit';
import { roundMoney } from '../../utils/money';
import { syncStockAlerts } from '../../utils/stockAlerts';

export interface UpdateProductInput {
  id: string;
  name?: string;
  description?: string;
  categoryId?: string;
  barcode?: string;
  cost?: number;
  price?: number;
  tax?: number;
  unit?: string;
  stock?: number;
  minStock?: number;
  status?: 'activo' | 'inactivo' | 'descontinuado';
  updatedBy?: string;
}

export class UpdateProduct {
  constructor(private readonly store: StoreGateway) {}

  async execute(input: UpdateProductInput) {
    if (!input.id) {
      throw new DomainError('VALIDATION_ERROR', 'Id de producto requerido', 400);
    }

    return this.store.withStoreLock((store) => {
      const product = store.products.find((p) => p.id === input.id);
      if (!product) {
        throw new DomainError('PRODUCT_NOT_FOUND', 'Producto no encontrado', 404);
      }

      const before = { ...product };

      if (input.name !== undefined) product.name = input.name.trim();
      if (input.description !== undefined) product.description = input.description;
      if (input.categoryId !== undefined) {
        const exists = store.categories.some((c) => c.id === input.categoryId && !c.deletedAt);
        if (!exists) throw new DomainError('CATEGORY_NOT_FOUND', 'Categoria no valida', 400);
        product.categoryId = input.categoryId;
      }
      if (input.barcode !== undefined) product.barcode = input.barcode;
      if (input.price !== undefined) {
        if (input.price <= 0) throw new DomainError('VALIDATION_ERROR', 'Precio invalido', 400);
        product.price = roundMoney(input.price);
      }
      if (input.cost !== undefined) {
        if (input.cost < 0) throw new DomainError('VALIDATION_ERROR', 'Costo invalido', 400);
        if (input.price !== undefined && input.cost > input.price) {
          throw new DomainError('VALIDATION_ERROR', 'Costo mayor que precio', 400);
        }
        product.cost = roundMoney(input.cost);
      }
      if (input.tax !== undefined) product.tax = input.tax;
      if (input.unit !== undefined) product.unit = input.unit;
      if (input.stock !== undefined) {
        if (input.stock < 0) throw new DomainError('VALIDATION_ERROR', 'Stock invalido', 400);
        product.stock = input.stock;

        const stockEntry = store.productStock.find((s) => s.productId === product.id);
        if (stockEntry) {
          stockEntry.stock = input.stock;
          stockEntry.lastMovementAt = new Date().toISOString();
        } else if (store.warehouses[0]) {
          store.productStock.push({
            id: `${product.id}-stk`,
            productId: product.id,
            warehouseId: store.warehouses[0].id,
            stock: input.stock,
            lastMovementAt: new Date().toISOString(),
          });
        }
      }
      if (input.minStock !== undefined) {
        if (input.minStock < 0) throw new DomainError('VALIDATION_ERROR', 'Stock minimo invalido', 400);
        product.minStock = input.minStock;
      }
      if (input.status !== undefined) product.status = input.status;
      product.updatedAt = new Date().toISOString();
      product.updatedBy = input.updatedBy ?? 'system';

      syncStockAlerts(store, product);
      pushAuditLog(store, {
        action: 'product_update',
        entityType: 'product',
        entityId: product.id,
        before,
        after: product,
      });

      return product;
    });
  }
}
