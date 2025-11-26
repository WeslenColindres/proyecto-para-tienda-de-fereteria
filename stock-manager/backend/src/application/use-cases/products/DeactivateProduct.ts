import { DomainError } from '../../../domain/errors/DomainError';
import type { StoreGateway } from '../../ports/StoreGateway';
import { pushAuditLog } from '../../utils/audit';
import { syncStockAlerts } from '../../utils/stockAlerts';

export class DeactivateProduct {
  constructor(private readonly store: StoreGateway) {}

  async execute(id: string) {
    if (!id) {
      throw new DomainError('VALIDATION_ERROR', 'Id de producto requerido', 400);
    }

    return this.store.withStoreLock((store) => {
      const product = store.products.find((p) => p.id === id);
      if (!product) {
        throw new DomainError('PRODUCT_NOT_FOUND', 'Producto no encontrado', 404);
      }

      const before = { ...product };
      product.status = 'descontinuado';
      product.deletedAt = new Date().toISOString();
      product.active = false;
      syncStockAlerts(store, product);

      pushAuditLog(store, {
        action: 'product_delete',
        entityType: 'product',
        entityId: id,
        before,
        after: product,
      });

      return product;
    });
  }
}
