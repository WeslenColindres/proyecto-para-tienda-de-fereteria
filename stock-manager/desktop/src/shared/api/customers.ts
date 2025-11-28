import { apiFetch } from './httpClient';
import type { CustomerItem, CustomerListResponse, CustomerStatus, CustomerType } from '../types/customers';

export interface ListCustomersParams {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: CustomerStatus | 'all';
  city?: string | 'all';
  type?: CustomerType | 'all';
  credit?: 'con' | 'sin' | 'all';
}

export type SaveCustomerPayload = {
  nit: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  type: CustomerType;
  hasCredit: boolean;
  creditLimit: number;
  creditUsed?: number;
  discount: number;
  status: CustomerStatus;
};

export const customersApi = {
  list: (params: ListCustomersParams = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.pageSize) query.append('limit', String(params.pageSize)); // Backend uses 'limit'
    if (params.q) query.append('search', params.q); // Backend uses 'search'
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.city && params.city !== 'all') query.append('city', params.city);
    if (params.type && params.type !== 'all') query.append('type', params.type);
    if (params.credit && params.credit !== 'all') query.append('credit', params.credit);
    const qs = query.toString();
    return apiFetch<CustomerListResponse>(`/api/clients${qs ? `?${qs}` : ''}`);
  },
  getById: (id: number | string) => apiFetch<CustomerItem>(`/api/clients/${id}`),
  create: (payload: SaveCustomerPayload) =>
    apiFetch<CustomerItem>('/api/clients', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: number | string, payload: Partial<SaveCustomerPayload>) =>
    apiFetch<CustomerItem>(`/api/clients/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id: number | string) => apiFetch<CustomerItem>(`/api/clients/${id}`, { method: 'DELETE' }),

  getSales: (id: number | string, params: { page?: number; pageSize?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.pageSize) query.append('limit', String(params.pageSize));
    const qs = query.toString();
    return apiFetch<{ data: any[]; total: number; page: number; totalPages: number }>(`/api/clients/${id}/sales${qs ? `?${qs}` : ''}`);
  },

  getCredit: (id: number | string) => apiFetch<{ limit: number; used: number; available: number }>(`/api/clients/${id}/credit`),
};
