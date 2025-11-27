export interface AccountsPayableProps {
    id: string;
    purchaseOrderId: string;
    supplierId: string;
    invoiceNumber: string;
    invoiceDate: Date;
    dueDate: Date;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    status: 'pending' | 'partial' | 'paid' | 'overdue';
    invoiceDocumentUrl?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export class AccountsPayable {
    constructor(public readonly props: AccountsPayableProps) { }

    get id() { return this.props.id; }
    get status() { return this.props.status; }
    get pendingAmount() { return this.props.pendingAmount; }

    registerPayment(amount: number) {
        if (amount <= 0) throw new Error('El monto del pago debe ser mayor a 0');
        if (amount > this.props.pendingAmount) throw new Error('El monto del pago excede el saldo pendiente');

        this.props.paidAmount += amount;
        this.props.pendingAmount -= amount;
        this.props.updatedAt = new Date();

        this.updateStatus();
    }

    private updateStatus() {
        if (this.props.pendingAmount <= 0) {
            this.props.status = 'paid';
        } else if (this.props.paidAmount > 0) {
            this.props.status = 'partial';
        } else {
            // Check for overdue
            const now = new Date();
            if (now > this.props.dueDate) {
                this.props.status = 'overdue';
            } else {
                this.props.status = 'pending';
            }
        }
    }

    toJSON() {
        return { ...this.props };
    }
}
