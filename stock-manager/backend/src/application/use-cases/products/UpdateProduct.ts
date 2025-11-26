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
  supplierId?: string;
  unitId?: string;
  isInventoriable?: boolean;
  isSellable?: boolean;
  isPurchasable?: boolean;
  reorderPoint?: number;
  maxStock?: number;
  physicalLocation?: string;
  updatedBy?: string;
}

export class UpdateProduct {
  constructor(private readonly store: StoreGateway) { }

  async execute(input: UpdateProductInput) {
    this.validateInput(input);

    return this.store.withStoreLock((store) => {
      const product = store.products.find((p) => p.id === input.id);
      if (!product) {
        throw new DomainError('PRODUCT_NOT_FOUND', 'Producto no encontrado', 404);
      }

      const before = { ...product };

      this.updateBasicFields(product, input);
      this.updateCategoryIfNeeded(product, store, input);
      this.updatePricingFields(product, input);
      this.updateStockFields(product, store, input);
      this.updateInventorySettings(product, input);
      this.updateMetadata(product, input);

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

  private validateInput(input: UpdateProductInput): void {
    if (!input.id) {
      throw new DomainError('VALIDATION_ERROR', 'Id de producto requerido', 400);
    }
  }

  private updateBasicFields(product: any, input: UpdateProductInput): void {
    if (input.name !== undefined) {
      product.name = input.name.trim();
    }
    if (input.description !== undefined) {
      product.description = input.description;
    }
    if (input.barcode !== undefined) {
      product.barcode = input.barcode;
    }
    if (input.unit !== undefined) {
      product.unit = input.unit;
    }
  }

  private updateCategoryIfNeeded(product: any, store: any, input: UpdateProductInput): void {
    if (input.categoryId === undefined) return;

    const categoryExists = store.categories.some(
      (c: any) => c.id === input.categoryId && !c.deletedAt
    );

    if (!categoryExists) {
      throw new DomainError('CATEGORY_NOT_FOUND', 'Categoria no valida', 400);
    }

    product.categoryId = input.categoryId;
  }

  private updatePricingFields(product: any, input: UpdateProductInput): void {
    // Validar relación costo-precio primero
    if (input.cost !== undefined && input.price !== undefined) {
      if (input.cost > input.price) {
        throw new DomainError('VALIDATION_ERROR', 'Costo mayor que precio', 400);
      }
    }

    if (input.price !== undefined) {
      if (input.price <= 0) {
        throw new DomainError('VALIDATION_ERROR', 'Precio invalido', 400);
      }
      product.price = roundMoney(input.price);
    }

    if (input.cost !== undefined) {
      if (input.cost < 0) {
        throw new DomainError('VALIDATION_ERROR', 'Costo invalido', 400);
      }
      // Validar contra precio existente si no se está actualizando
      if (input.price === undefined && input.cost > product.price) {
        throw new DomainError('VALIDATION_ERROR', 'Costo mayor que precio', 400);
      }
      product.cost = roundMoney(input.cost);
    }

    if (input.tax !== undefined) {
      product.tax = input.tax;
    }
  }

  private updateStockFields(product: any, store: any, input: UpdateProductInput): void {
    this.validateStockInputs(input);

    if (input.stock !== undefined) {
      product.stock = input.stock;
      this.updateStockEntry(product, store, input.stock);
    }

    if (input.minStock !== undefined) product.minStock = input.minStock;
    if (input.reorderPoint !== undefined) product.reorderPoint = input.reorderPoint;
    if (input.maxStock !== undefined) product.maxStock = input.maxStock;
    if (input.physicalLocation !== undefined) product.physicalLocation = input.physicalLocation;
  }

  private validateStockInputs(input: UpdateProductInput): void {
    const stockFields = [
      { value: input.stock, name: 'Stock' },
      { value: input.minStock, name: 'Stock minimo' },
      { value: input.reorderPoint, name: 'Punto de reorden' },
      { value: input.maxStock, name: 'Stock maximo' }
    ];

    for (const field of stockFields) {
      if (field.value !== undefined && field.value < 0) {
        throw new DomainError('VALIDATION_ERROR', `${field.name} invalido`, 400);
      }
    }
  }

  private updateStockEntry(product: any, store: any, newStock: number): void {
    const now = new Date().toISOString();
    const stockEntry = store.productStock.find((s: any) => s.productId === product.id);

    if (stockEntry) {
      stockEntry.stock = newStock;
      stockEntry.available = newStock;
      stockEntry.lastMovementAt = now;
      stockEntry.lastUpdated = now;
    } else if (store.warehouses[0]) {
      store.productStock.push({
        id: `${product.id}-stk`,
        productId: product.id,
        branchId: store.warehouses[0].id,
        warehouseId: store.warehouses[0].id,
        stock: newStock,
        available: newStock,
        reserved: 0,
        inTransit: 0,
        lastMovementAt: now,
        lastUpdated: now,
      });
    }
  }

  private updateInventorySettings(product: any, input: UpdateProductInput): void {
    if (input.supplierId !== undefined) product.supplierId = input.supplierId;
    if (input.unitId !== undefined) product.unitId = input.unitId;
    if (input.isInventoriable !== undefined) product.isInventoriable = input.isInventoriable;
    if (input.isSellable !== undefined) product.isSellable = input.isSellable;
    if (input.isPurchasable !== undefined) product.isPurchasable = input.isPurchasable;
    if (input.status !== undefined) product.status = input.status;
  }

  private updateMetadata(product: any, input: UpdateProductInput): void {
    product.updatedAt = new Date().toISOString();
    product.updatedBy = input.updatedBy ?? 'system';
  }
}