import { randomUUID } from 'crypto';
import { DomainError } from '../../../domain/errors/DomainError';
import { PurchaseOrder } from '../../../domain/entities/PurchaseOrder';
import { IPurchaseOrderRepository } from '../../../domain/repositories/IPurchaseOrderRepository';
import { ISupplierRepository } from '../../../domain/repositories/ISupplierRepository';
import { Money } from '../../../domain/value-objects/Money';

export interface CreatePurchaseOrderInput {
    supplierId: string;
    branchId: string;
    userId: string;
    items: { productId: string; quantity: number; unitCost: number }[];
    expectedDeliveryDate?: Date;
    notes?: string;
}

export class CreatePurchaseOrder {
    constructor(
        private readonly orderRepository: IPurchaseOrderRepository,
        private readonly supplierRepository: ISupplierRepository
    ) { }

    async execute(input: CreatePurchaseOrderInput) {
        // 1. Validate Supplier
        const supplier = await this.supplierRepository.findById(input.supplierId);
        if (!supplier) {
            throw new DomainError('NOT_FOUND', 'Proveedor no encontrado', 404);
        }

        // 2. Create Order Aggregate
        const orderNumber = `OC-${Date.now()}`; // Simple generation strategy
        const order = new PurchaseOrder({
            id: randomUUID(),
            orderNumber,
            supplierId: input.supplierId,
            branchId: input.branchId,
            userId: input.userId,
            date: new Date(),
            expectedDeliveryDate: input.expectedDeliveryDate,
            status: 'PENDIENTE',
            items: [],
            subtotal: Money.from(0),
            tax: Money.from(0),
            total: Money.from(0),
            notes: input.notes,
            createdAt: new Date()
        });

        // 3. Add Items
        for (const item of input.items) {
            order.addItem(item.productId, item.quantity, item.unitCost);
        }

        // 4. Persist
        await this.orderRepository.save(order);

        return order;
    }
}
