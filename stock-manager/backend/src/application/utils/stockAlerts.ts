import { randomUUID } from 'node:crypto';
import type { ProductProps } from '../../domain/entities/Product';
import type { StoreSchema } from '../ports/StoreGateway';

export function syncStockAlerts(store: StoreSchema, product: ProductProps): void {
  store.alerts = store.alerts.filter((alert) => alert.productId !== product.id);

  const base = {
    id: randomUUID(),
    productId: product.id,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  if (product.stock === 0 || product.stock < product.minStock * 0.5) {
    store.alerts.push({
      ...base,
      type: 'stock_critical',
      level: 'critical',
      message: `Stock critico para ${product.name}`,
    });
  } else if (product.stock < product.minStock) {
    store.alerts.push({
      ...base,
      type: 'stock_low',
      level: 'warning',
      message: `Stock bajo para ${product.name}`,
    });
  } else if (product.stock < product.minStock * 1.5) {
    store.alerts.push({
      ...base,
      type: 'stock_preventive',
      level: 'info',
      message: `Stock preventivo para ${product.name}`,
    });
  }
}
