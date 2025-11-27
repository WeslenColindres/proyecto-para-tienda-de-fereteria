import { Money } from '../value-objects/Money';

export interface PurchaseOrderItemProps {
    productId: string;
    quantity: number;
    unitCost: Money;
    total: Money;
    receivedQuantity: number;
}

export interface PurchaseOrderProps {
    id: string;
    orderNumber: string;
    supplierId: string;
    branchId: string; // Sucursal
    userId: string; // Solicitante
    date: Date;
    expectedDeliveryDate?: Date;
    actualDeliveryDate?: Date;
    status: 'PENDIENTE' | 'ENVIADA' | 'PARCIAL' | 'RECIBIDA' | 'CANCELADA';
    items: PurchaseOrderItemProps[];
    subtotal: Money;
    tax: Money;
    total: Money;
    notes?: string;
    receivedBy?: string;
    receivedAt?: Date;
    invoiceDocumentUrl?: string;
    createdAt: Date;
    updatedAt?: Date;
}

export class PurchaseOrder {
    constructor(public readonly props: PurchaseOrderProps) { }

    addItem(productId: string, quantity: number, unitCost: number) {
        if (this.props.status !== 'PENDIENTE') {
            throw new Error('No se pueden agregar items a una orden procesada');
        }

        const cost = Money.from(unitCost);
        const total = Money.from(unitCost * quantity);

        this.props.items.push({
            productId,
            quantity,
            unitCost: cost,
            total: total,
            receivedQuantity: 0
        });

        this.recalculateTotals();
    }

    receiveOrder(userId: string, items: { productId: string, quantity: number }[]) {
        if (this.props.status === 'CANCELADA' || this.props.status === 'RECIBIDA') {
            throw new Error('No se puede recibir una orden cancelada o ya recibida');
        }

        let allReceived = true;
        let anyReceived = false;

        for (const item of this.props.items) {
            const received = items.find(i => i.productId === item.productId);
            if (received) {
                item.receivedQuantity += received.quantity;
                anyReceived = true;
            }
            if (item.receivedQuantity < item.quantity) {
                allReceived = false;
            }
        }

        if (anyReceived) {
            this.props.status = allReceived ? 'RECIBIDA' : 'PARCIAL';
            this.props.receivedBy = userId;
            this.props.receivedAt = new Date();
            if (allReceived) {
                this.props.actualDeliveryDate = new Date();
            }
        }
        this.props.updatedAt = new Date();
    }

    private recalculateTotals() {
        let subtotal = 0;
        for (const item of this.props.items) {
            subtotal += item.total.amount;
        }

        this.props.subtotal = Money.from(subtotal);
        // Simple tax logic for now (e.g. 0 or included, depending on business rule)
        // Assuming costs are net for now
        this.props.total = this.props.subtotal;
    }

    toJSON() {
        return {
            ...this.props,
            subtotal: this.props.subtotal.amount,
            total: this.props.total.amount,
            items: this.props.items.map(i => ({
                ...i,
                unitCost: i.unitCost.amount,
                total: i.total.amount
            }))
        };
    }
}
