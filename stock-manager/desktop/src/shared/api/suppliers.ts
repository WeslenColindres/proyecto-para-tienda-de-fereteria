import { apiFetch } from './httpClient';
import type { SupplierItem, SupplierListResponse, SupplierPurchaseRow, SupplierReportResponse, SupplierCatalogs } from '../types/suppliers';
import type { SupplierStatus } from '../types/suppliers';

export interface ListSuppliersParams {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: SupplierStatus | 'all';
  cityId?: string | 'all';
  categoryId?: string | 'all';
}

export interface SaveSupplierPayload {
  nit: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  cityId: string;
  categoryId: string;
  address?: string;
  creditDays: number;
  creditLimit: number;
  status: SupplierStatus;
  balance?: number;
  overdueDays?: number;
}

export const suppliersApi = {
  list: (params: ListSuppliersParams = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.pageSize) query.append('pageSize', String(params.pageSize));
    if (params.q) query.append('q', params.q);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.cityId && params.cityId !== 'all') query.append('cityId', params.cityId);
    if (params.categoryId && params.categoryId !== 'all') query.append('categoryId', params.categoryId);
    const qs = query.toString();
    return apiFetch<SupplierListResponse>(`/api/suppliers${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string) => apiFetch<SupplierItem>(`/api/suppliers/${id}`),

  create: (payload: SaveSupplierPayload) =>
    apiFetch<SupplierItem>('/api/suppliers', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: Partial<SaveSupplierPayload>) =>
    apiFetch<SupplierItem>(`/api/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  remove: (id: string) =>
    apiFetch<SupplierItem>(`/api/suppliers/${id}`, {
      method: 'DELETE',
    }),

  purchases: (supplierId: string, limit?: number) => {
    const query = limit ? `?limit=${limit}` : '';
    return apiFetch<SupplierPurchaseRow[]>(`/api/suppliers/${supplierId}/purchases${query}`);
  },

  report: (params: { from?: string; to?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.from) query.append('from', params.from);
    if (params.to) query.append('to', params.to);
    const qs = query.toString();
    return apiFetch<SupplierReportResponse>(`/api/suppliers/report${qs ? `?${qs}` : ''}`);
  },

  catalogs: () => apiFetch<SupplierCatalogs>('/api/suppliers/catalogs'),
};
