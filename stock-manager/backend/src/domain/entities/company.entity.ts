export interface CompanyProps {
    id?: number;
    tradeName: string;
    businessName: string;
    nit: string;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    logoUrl?: string | null;
    constitutionDate?: Date | null;
    isActive: boolean;
    createdAt?: Date;
}

export class Company {
    constructor(public readonly props: CompanyProps) { }

    get id(): number | undefined {
        return this.props.id;
    }

    get tradeName(): string {
        return this.props.tradeName;
    }

    get businessName(): string {
        return this.props.businessName;
    }

    get nit(): string {
        return this.props.nit;
    }
}
