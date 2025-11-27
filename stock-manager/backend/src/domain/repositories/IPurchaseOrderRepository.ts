import { PurchaseOrder } from '../entities/PurchaseOrder';

export interface ReceivedItem {
    productId: string;
    quantity: number;
}

export interface PurchaseOrderListResult {
    data: PurchaseOrder[];
    total: number;
    page: number;
    pageSize: number;
}

export interface ListPurchaseOrdersParams {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    supplierId?: string;
    startDate?: Date;
    endDate?: Date;
}

export interface IPurchaseOrderRepository {
    save(order: PurchaseOrder): Promise<void>;
    findById(id: string): Promise<PurchaseOrder | null>;
    findByOrderNumber(orderNumber: string): Promise<PurchaseOrder | null>;
    findAll(params: ListPurchaseOrdersParams): Promise<PurchaseOrderListResult>;
    findBySupplierId(supplierId: string, limit?: number): Promise<PurchaseOrder[]>;
    updateStatus(id: string, status: string): Promise<void>;
    markAsReceived(id: string, userId: string, items: ReceivedItem[]): Promise<void>;
}
