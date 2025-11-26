import { apiFetch } from './httpClient';
import type { SaleDetail, SaleListResponse, SaleDocumentType } from '../types/sales';
import type { SaleStatus } from '../types/sales';

export interface ListSalesParams {
  page?: number;
  pageSize?: number;
  docType?: SaleDocumentType | 'all';
  status?: SaleStatus | 'all';
  search?: string;
  returnsOnly?: boolean;
  from?: string;
  to?: string;
}

export interface CreateSalePayload {
  docType: SaleDocumentType;
  clientName: string;
  clientNit: string;
  user: string;
  items: Array<{ productId: string; qty: number; price?: number }>;
}

export const salesApi = {
  list: (params: ListSalesParams = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', String(params.page));
    if (params.pageSize) query.append('pageSize', String(params.pageSize));
    if (params.docType && params.docType !== 'all') query.append('docType', params.docType);
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    if (params.returnsOnly) query.append('returnsOnly', 'true');
    if (params.from) query.append('from', params.from);
    if (params.to) query.append('to', params.to);

    const qs = query.toString();
    return apiFetch<SaleListResponse>(`/api/sales${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string) => apiFetch<SaleDetail>(`/api/sales/${id}`),

  create: (payload: CreateSalePayload) =>
    apiFetch<SaleDetail>('/api/sales', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

