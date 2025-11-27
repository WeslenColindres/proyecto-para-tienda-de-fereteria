export type OrderStatus = 'PENDIENTE' | 'ENVIADA' | 'PARCIAL' | 'RECIBIDA' | 'CANCELADA';

export interface PurchaseOrderItem {
    productId: string;
    productName?: string; // For display
    quantity: number;
    unitCost: number;
    total: number;
    receivedQuantity?: number;
}

export interface PurchaseOrder {
    id: string;
    orderNumber: string;
    supplierId: string;
    supplierName?: string; // For display
    branchId: string;
    userId: string;
    date: string;
    expectedDeliveryDate?: string;
    actualDeliveryDate?: string;
    status: OrderStatus;
    items: PurchaseOrderItem[];
    subtotal: number;
    tax: number;
    total: number;
    notes?: string;
    receivedBy?: string;
    receivedAt?: string;
    invoiceDocumentUrl?: string;
    createdAt: string;
}

export interface CreatePurchaseOrderPayload {
    supplierId: string;
    branchId: string;
    items: {
        productId: string;
        quantity: number;
        unitCost: number;
    }[];
    notes?: string;
    expectedDeliveryDate?: string;
}

export interface ReceivedItem {
    productId: string;
    quantity: number;
}

export interface ReceiveOrderPayload {
    items: ReceivedItem[];
}

export interface ListPurchaseOrdersParams {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    supplierId?: string;
}

export interface PurchaseOrderListResult {
    data: PurchaseOrder[];
    total: number;
    page: number;
    pageSize: number;
}
