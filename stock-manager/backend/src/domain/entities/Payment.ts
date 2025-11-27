export interface PaymentProps {
    id: string;
    accountsPayableId: string;
    amount: number;
    paymentDate: Date;
    paymentMethod: string;
    referenceNumber?: string;
    notes?: string;
    createdBy: string;
    createdAt: Date;
}

export class Payment {
    constructor(public readonly props: PaymentProps) { }

    get id() { return this.props.id; }
    get amount() { return this.props.amount; }

    toJSON() {
        return { ...this.props };
    }
}
