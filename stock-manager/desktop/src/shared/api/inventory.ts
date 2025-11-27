import { apiFetch } from './httpClient';
import type { InventoryReport } from '../types/products';

export const inventoryApi = {
  overview: () => apiFetch<InventoryReport>('/api/inventory/overview'),
  getWarehouses: () => apiFetch<any[]>('/api/inventory/warehouses'),
  updateStock: (productId: number, data: any) => apiFetch<any>(`/api/inventory/products/${productId}/stock`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};
