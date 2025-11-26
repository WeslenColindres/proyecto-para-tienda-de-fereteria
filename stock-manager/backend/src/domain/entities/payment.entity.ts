export interface PaymentProps {
    id?: number;
    saleId: number;
    paymentMethodId: number;
    amount: number;
    authNumber?: string | null;
    referenceNumber?: string | null;
    bank?: string | null;
    checkNumber?: string | null;
    paymentDate: Date;
    status: string;
    accreditationDate?: Date | null;
    observations?: string | null;
    createdAt?: Date;
}

export class Payment {
    constructor(public readonly props: PaymentProps) { }

    get id(): number | undefined {
        return this.props.id;
    }

    get amount(): number {
        return this.props.amount;
    }
}
