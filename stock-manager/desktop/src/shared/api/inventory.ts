import { apiFetch } from './httpClient';
import type { InventoryReport } from '../types/products';

export const inventoryApi = {
  overview: () => apiFetch<InventoryReport>('/api/inventory/overview'),
};
