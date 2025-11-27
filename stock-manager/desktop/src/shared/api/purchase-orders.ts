import { apiFetch } from './httpClient';
import {
    PurchaseOrder,
    CreatePurchaseOrderPayload,
    ReceiveOrderPayload,
    ListPurchaseOrdersParams,
    PurchaseOrderListResult
} from '../../features/suppliers/types';

export const purchaseOrdersApi = {
    list: (params: ListPurchaseOrdersParams) => {
        const query = new URLSearchParams();
        if (params.page) query.append('page', params.page.toString());
        if (params.pageSize) query.append('pageSize', params.pageSize.toString());
        if (params.search) query.append('search', params.search);
        if (params.status && params.status !== 'all') query.append('status', params.status);
        if (params.supplierId && params.supplierId !== 'all') query.append('supplierId', params.supplierId);

        return apiFetch<PurchaseOrderListResult>(`/api/purchase-orders?${query.toString()}`);
    },

    getById: (id: string) =>
        apiFetch<PurchaseOrder>(`/api/purchase-orders/${id}`),

    create: (payload: CreatePurchaseOrderPayload) =>
        apiFetch<PurchaseOrder>('/api/purchase-orders', {
            method: 'POST',
            body: JSON.stringify(payload)
        }),

    update: (id: string, payload: Partial<CreatePurchaseOrderPayload>) =>
        apiFetch<PurchaseOrder>(`/api/purchase-orders/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        }),

    receive: (id: string, payload: ReceiveOrderPayload) =>
        apiFetch<{ success: boolean, message: string }>(`/api/purchase-orders/${id}/receive`, {
            method: 'POST',
            body: JSON.stringify(payload)
        }),

    cancel: (id: string) =>
        apiFetch<{ success: boolean, message: string }>(`/api/purchase-orders/${id}/cancel`, {
            method: 'POST'
        }),

    uploadInvoice: (id: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiFetch<{ fileUrl: string, message: string }>(`/api/purchase-orders/${id}/upload-invoice`, {
            method: 'POST',
            body: formData,
            headers: {} // Let browser set Content-Type for FormData
        });
    }
};
