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
  params.set('preloadChunks', '3');
  const query = params.toString();
  return query ? `?${query}` : '';
};

export const productsApi = {
  list: (filters?: ProductFilters) => apiFetch<ProductListResponse>(`/api/products${buildQuery(filters)}`),
  get: (id: string) => apiFetch<ProductDetail>(`/api/products/${id}`),
  create: (payload: Partial<ProductItem>) =>
    apiFetch<ProductItem>('/api/products', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string, payload: Partial<ProductItem>) =>
    apiFetch<ProductItem>(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id: string) => apiFetch<ProductItem>(`/api/products/${id}`, { method: 'DELETE' }),
  movements: (id: string, pagination?: { page?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (pagination?.page) params.set('page', String(pagination.page));
    if (pagination?.limit) params.set('limit', String(pagination.limit));
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiFetch<{ data: InventoryMovement[] }>(`/api/products/${id}/movements${query}`);
  },
  exportTemplate: (format: 'xlsx' | 'csv' = 'xlsx') =>
    apiFetchBlob(`/api/products/export/template?format=${format}`),
  exportData: (filters?: ProductFilters) => apiFetchBlob(`/api/products/export${buildQuery(filters)}`),
  importFile: (file: File, mode: 'regular' | 'initial' = 'regular') => {
    const form = new FormData();
    form.append('file', file);
    const query = mode === 'initial' ? '?mode=initial' : '';
    return apiFetch<ImportSummary>(`/api/products/import${query}`, { method: 'POST', body: form });
  },
};
