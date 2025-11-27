import { apiFetch, apiFetchBlob } from './httpClient';
import type {
  InventoryMovement,
  ImportSummary,
  ProductDetail,
  ProductFilters,
  ProductItem,
  ProductListResponse,
} from '../types/products';

const buildQuery = (filters?: ProductFilters) => {
  const params = new URLSearchParams();
  if (!filters) return '';
  if (filters.search) params.set('search', filters.search);
  if (filters.categoryId && filters.categoryId !== 'all') params.set('categoryId', filters.categoryId);
  if (filters.stockState && filters.stockState !== 'all') params.set('stockState', filters.stockState);
  if (filters.status && filters.status !== 'all') params.set('status', filters.status);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.pageSize) params.set('pageSize', String(filters.pageSize));
  if (filters.orderBy) params.set('orderBy', filters.orderBy);
  if (filters.orderDir) params.set('orderDir', filters.orderDir);
  params.set('preloadChunks', '3');
  const query = params.toString();
  return query ? `?${query}` : '';
};

export const productsApi = {
  list: (filters?: ProductFilters) => apiFetch<ProductListResponse>(`/api/inventory/products${buildQuery(filters)}`),
  get: (id: string) => apiFetch<ProductDetail>(`/api/inventory/products/${id}`),
  create: (payload: Partial<ProductItem>) =>
    apiFetch<ProductItem>('/api/inventory/products', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string, payload: Partial<ProductItem>) =>
    apiFetch<ProductItem>(`/api/inventory/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id: string) => apiFetch<ProductItem>(`/api/inventory/products/${id}`, { method: 'DELETE' }),
  movements: (id: string, pagination?: { page?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (pagination?.page) params.set('page', String(pagination.page));
    if (pagination?.limit) params.set('limit', String(pagination.limit));
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiFetch<{ data: InventoryMovement[] }>(`/api/inventory/products/${id}/movements${query}`);
  },
  exportTemplate: (format: 'xlsx' | 'csv' = 'xlsx') =>
    apiFetchBlob(`/api/inventory/products/export/template?format=${format}`),
  exportData: (filters?: ProductFilters) => apiFetchBlob(`/api/inventory/products/export${buildQuery(filters)}`),
  importFile: (file: File, mode: 'regular' | 'initial' = 'regular') => {
    const form = new FormData();
    form.append('file', file);
    const query = mode === 'initial' ? '?mode=initial' : '';
    return apiFetch<ImportSummary>(`/api/inventory/products/import${query}`, { method: 'POST', body: form });
  },
  previewImport: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return apiFetch<any[]>('/api/inventory/products/import/preview', { method: 'POST', body: form });
  },
  confirmImport: (products: any[]) =>
    apiFetch<{ processed: number; errors: any[] }>('/api/inventory/products/import/confirm', {
      method: 'POST',
      body: JSON.stringify({ products }),
    }),

  // Suppliers
  getSuppliers: (productId: string) =>
    apiFetch<any[]>(`/api/inventory/products/${productId}/suppliers`),
  addSupplier: (productId: string, payload: { supplierId: string; cost: number; code?: string; isMain?: boolean }) =>
    apiFetch(`/api/inventory/products/${productId}/suppliers`, { method: 'POST', body: JSON.stringify(payload) }),
  removeSupplier: (productId: string, supplierId: string) =>
    apiFetch(`/api/inventory/products/${productId}/suppliers/${supplierId}`, { method: 'DELETE' }),
  updateSupplierPrice: (productId: string, supplierId: string, price: number) =>
    apiFetch(`/api/inventory/products/${productId}/suppliers/${supplierId}`, { method: 'PUT', body: JSON.stringify({ price }) }),
};
