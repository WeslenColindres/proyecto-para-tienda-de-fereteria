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
    status: 'PENDIENTE' | 'PARCIAL' | 'COMPLETADA' | 'CANCELADA';
    items: PurchaseOrderItemProps[];
    subtotal: Money;
    tax: Money;
    total: Money;
    notes?: string;
    createdAt: Date;
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
