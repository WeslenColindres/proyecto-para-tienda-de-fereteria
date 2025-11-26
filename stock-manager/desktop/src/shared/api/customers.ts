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
    if (params.pageSize) query.append('pageSize', String(params.pageSize));
    if (params.q) query.append('q', params.q);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.city && params.city !== 'all') query.append('city', params.city);
    if (params.type && params.type !== 'all') query.append('type', params.type);
    if (params.credit && params.credit !== 'all') query.append('credit', params.credit);
    const qs = query.toString();
    return apiFetch<CustomerListResponse>(`/api/customers${qs ? `?${qs}` : ''}`);
  },
  getById: (id: string) => apiFetch<CustomerItem>(`/api/customers/${id}`),
  create: (payload: SaveCustomerPayload) =>
    apiFetch<CustomerItem>('/api/customers', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string, payload: Partial<SaveCustomerPayload>) =>
    apiFetch<CustomerItem>(`/api/customers/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id: string) => apiFetch<CustomerItem>(`/api/customers/${id}`, { method: 'DELETE' }),
};
