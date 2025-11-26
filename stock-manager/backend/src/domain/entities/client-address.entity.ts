export interface ClientAddressProps {
    id?: number;
    clientId: number;
    addressType?: string | null;
    address: string;
    department?: string | null;
    municipality?: string | null;
    zone?: string | null;
    reference?: string | null;
    isDefault: boolean;
    createdAt?: Date;
}

export class ClientAddress {
    constructor(public readonly props: ClientAddressProps) { }

    get id(): number | undefined {
        return this.props.id;
    }

    get fullAddress(): string {
        return `${this.props.address}, ${this.props.municipality || ''}, ${this.props.department || ''}`;
    }
}
