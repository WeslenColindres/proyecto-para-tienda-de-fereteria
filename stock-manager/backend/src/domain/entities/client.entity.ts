export interface ClientProps {
    id?: number;
    nit: string;
    name: string;
    tradeName?: string | null;
    clientTypeId: number;
    email?: string | null;
    phone?: string | null;
    birthDate?: Date | null;
    creditLimit: number;
    creditDays: number;
    isActive: boolean;
    registeredAt?: Date;
    lastPurchaseAt?: Date | null;
}

export class Client {
    constructor(public readonly props: ClientProps) { }

    get id(): number | undefined {
        return this.props.id;
    }

    get name(): string {
        return this.props.name;
    }

    get nit(): string {
        return this.props.nit;
    }
}
