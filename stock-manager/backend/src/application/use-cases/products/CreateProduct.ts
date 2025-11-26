import { randomUUID } from 'node:crypto';
import { Product, type ProductStatus } from '../../../domain/entities/Product';
import type { WarehouseProps } from '../../../domain/entities/Warehouse';
import { DomainError } from '../../../domain/errors/DomainError';
import type { StoreGateway } from '../../ports/StoreGateway';
import { pushAuditLog } from '../../utils/audit';
import { roundMoney } from '../../utils/money';
import { syncStockAlerts } from '../../utils/stockAlerts';

export interface CreateProductInput {
  code: string;
  name: string;
  description?: string;
  categoryId?: string;
  barcode?: string;
  cost?: number;
  price: number;
  tax?: number;
  unit?: string;
  stock?: number;
  minStock?: number;
  status?: ProductStatus;
  createdBy?: string;
}

export class CreateProduct {
  constructor(private readonly store: StoreGateway) {}

  async execute(input: CreateProductInput) {
    if (!input.code?.trim() || !input.name?.trim()) {
      throw new DomainError('VALIDATION_ERROR', 'Codigo y nombre son obligatorios', 400);
    }
    if (input.price <= 0) {
      throw new DomainError('VALIDATION_ERROR', 'El precio debe ser mayor que 0', 400);
    }
    if (input.cost !== undefined && input.cost < 0) {
      throw new DomainError('VALIDATION_ERROR', 'El costo no puede ser negativo', 400);
    }
    if (input.stock !== undefined && input.stock < 0) {
      throw new DomainError('VALIDATION_ERROR', 'El stock no puede ser negativo', 400);
    }
    if (input.minStock !== undefined && input.minStock < 0) {
      throw new DomainError('VALIDATION_ERROR', 'El stock minimo no puede ser negativo', 400);
    }
    if (input.cost !== undefined && input.cost > input.price) {
      throw new DomainError('VALIDATION_ERROR', 'El costo no puede ser mayor al precio', 400);
    }

    const normalizedCode = input.code.trim();
    const normalizedName = input.name.trim();

    const product = await this.store.withStoreLock((store) => {
      const exists = store.products.some((p) => p.code === normalizedCode && p.deletedAt == null);
      if (exists) {
        throw new DomainError('DUPLICATE_CODE', 'Ya existe un producto con este codigo', 409);
      }

      const categoryId = input.categoryId ?? store.categories[0]?.id;
      if (categoryId && !store.categories.some((c) => c.id === categoryId && !c.deletedAt)) {
        throw new DomainError('CATEGORY_NOT_FOUND', 'Categoria no encontrada', 404);
      }

      const now = new Date().toISOString();
      const status: ProductStatus = input.status ?? 'activo';
      const entity = new Product({
        id: randomUUID(),
        code: normalizedCode,
        name: normalizedName,
        description: input.description ?? '',
        categoryId,
        barcode: input.barcode ?? normalizedCode,
        cost: roundMoney(input.cost ?? input.price * 0.6),
        price: roundMoney(input.price),
        tax: input.tax ?? 12,
        unit: input.unit ?? 'unidad',
        status,
        stock: input.stock ?? 0,
        minStock: input.minStock ?? 0,
        createdAt: now,
        updatedAt: now,
        createdBy: input.createdBy ?? 'system',
        updatedBy: input.createdBy ?? 'system',
      });

      store.products.push(entity.toJSON());
      const defaultWarehouse: WarehouseProps =
        store.warehouses[0] ??
        ({
          id: 'wh-main',
          code: 'WH-01',
          name: 'Almacen Principal',
          createdAt: now,
          updatedAt: now,
        } as WarehouseProps);

      if (!store.warehouses.length) {
        store.warehouses.push(defaultWarehouse);
      }

      store.productStock.push({
        id: randomUUID(),
        productId: entity.id,
        warehouseId: defaultWarehouse.id,
        stock: input.stock ?? 0,
        lastMovementAt: now,
      });

      syncStockAlerts(store, entity.toJSON());
      pushAuditLog(store, {
        action: 'product_create',
        entityType: 'product',
        entityId: entity.id,
        before: null,
        after: entity.toJSON(),
      });

      return entity;
    });

    return product;
  }
}
