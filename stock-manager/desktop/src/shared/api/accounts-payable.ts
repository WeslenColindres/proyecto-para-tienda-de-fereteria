import { apiFetch } from './httpClient';

export interface AccountsPayableItem {
    id: string;
    purchaseOrderId: string;
    supplierId: string;
    supplierName: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    status: 'pendiente' | 'parcial' | 'pagada' | 'vencida';
    invoiceDocumentUrl?: string;
    notes?: string;
    createdAt: string;
}

export interface Payment {
    id: string;
    accountsPayableId: string;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    referenceNumber?: string;
    notes?: string;
    createdBy: string;
    createdAt: string;
}

export interface ListAccountsPayableParams {
    page?: number;
    pageSize?: number;
    search?: string;
    supplierId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
}

export interface AccountsPayableListResponse {
    data: AccountsPayableItem[];
    total: number;
    page: number;
    pageSize: number;
}

export interface CreateAccountsPayablePayload {
    purchaseOrderId: string;
    supplierId: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    totalAmount: number;
    notes?: string;
}

export interface PaymentPayload {
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    referenceNumber?: string;
    notes?: string;
}

export interface AgingReportItem {
    range: string; // '0-30', '31-60', '61-90', '90+'
    amount: number;
    count: number;
}

export interface SupplierReportItem {
    supplierId: string;
    supplierName: string;
    totalPurchased: number;
    totalPaid: number;
    totalPending: number;
    lastPurchaseDate: string;
}

export const accountsPayableApi = {
    list: (params: ListAccountsPayableParams) => {
        const query = new URLSearchParams();
        if (params.page) query.append('page', params.page.toString());
        if (params.pageSize) query.append('pageSize', params.pageSize.toString());
        if (params.search) query.append('search', params.search);
        if (params.supplierId) query.append('supplierId', params.supplierId);
        if (params.status) query.append('status', params.status);
        if (params.startDate) query.append('startDate', params.startDate);
        if (params.endDate) query.append('endDate', params.endDate);

        return apiFetch<AccountsPayableListResponse>(`/api/accounts-payable?${query.toString()}`);
    },

    getById: (id: string) =>
        apiFetch<AccountsPayableItem>(`/api/accounts-payable/${id}`),

    create: (payload: CreateAccountsPayablePayload) =>
        apiFetch<AccountsPayableItem>('/api/accounts-payable', {
            method: 'POST',
            body: JSON.stringify(payload)
        }),

    registerPayment: (accountId: string, payload: PaymentPayload) =>
        apiFetch<Payment>(`/api/accounts-payable/${accountId}/payments`, {
            method: 'POST',
            body: JSON.stringify(payload)
        }),

    getAgingReport: (supplierId?: string) => {
        const query = new URLSearchParams();
        if (supplierId) query.append('supplierId', supplierId);
        return apiFetch<AgingReportItem[]>(`/api/accounts-payable/reports/aging?${query.toString()}`);
    },

    getSupplierReport: (params: { startDate?: string; endDate?: string }) => {
        const query = new URLSearchParams();
        if (params.startDate) query.append('startDate', params.startDate);
        if (params.endDate) query.append('endDate', params.endDate);
        return apiFetch<SupplierReportItem[]>(`/api/accounts-payable/reports/supplier?${query.toString()}`);
    },

    uploadInvoice: (accountId: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiFetch<{ url: string }>(`/api/accounts-payable/${accountId}/invoice`, {
            method: 'POST',
            body: formData,
            headers: {} // Let browser set content type
        });
    }
};
