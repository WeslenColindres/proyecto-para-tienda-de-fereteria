import type { SaleDetail } from './sales';
import type { AlertItem, Category, ProductItem } from './products';
import type { SupplierItem } from './suppliers';
import type { CustomerItem } from './customers';

export type RealtimeEvent =
  | { type: 'ready' }
  | { type: 'sale.created'; payload: SaleDetail }
  | { type: 'inventory.updated'; payload: Array<{ id: string; stock: number }> }
  | { type: 'product.updated'; payload: ProductItem }
  | { type: 'product.deleted'; payload: { id: string } }
  | { type: 'category.updated'; payload: Category }
  | { type: 'alert.created'; payload: AlertItem[] }
  | { type: 'supplier.created'; payload: SupplierItem }
  | { type: 'supplier.updated'; payload: SupplierItem }
  | { type: 'supplier.deleted'; payload: { id: string } }
  | { type: 'supplier.purchase.created'; payload: unknown }
  | { type: 'customer.created'; payload: CustomerItem }
  | { type: 'customer.updated'; payload: CustomerItem }
  | { type: 'customer.deleted'; payload: { id: string } }
  | { type: 'system.update_available'; payload: { version: string; notes?: string } };

export type RealtimeHandler = (event: RealtimeEvent) => void;
