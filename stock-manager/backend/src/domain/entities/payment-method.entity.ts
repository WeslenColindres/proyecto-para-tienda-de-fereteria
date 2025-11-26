export interface PaymentMethodProps {
    id?: number;
    code: string;
    name: string;
    requiresAuth: boolean;
    accreditationDays: number;
    isActive: boolean;
}

export class PaymentMethod {
    constructor(public readonly props: PaymentMethodProps) { }

    get id(): number | undefined {
        return this.props.id;
    }

    get name(): string {
        return this.props.name;
    }
}
