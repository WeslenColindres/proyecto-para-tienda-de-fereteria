import { PurchaseOrder } from '../entities/PurchaseOrder';

export interface IPurchaseOrderRepository {
    save(order: PurchaseOrder): Promise<void>;
    findById(id: string): Promise<PurchaseOrder | null>;
    findByOrderNumber(orderNumber: string): Promise<PurchaseOrder | null>;
}
