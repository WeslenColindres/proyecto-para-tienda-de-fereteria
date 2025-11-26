export interface ProviderProps {
    id?: number;
    nit: string;
    name: string;
    tradeName?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    deliveryDays: number;
    rating?: number | null;
    isActive: boolean;
    registeredAt?: Date;
}

export class Provider {
    constructor(public readonly props: ProviderProps) { }

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
