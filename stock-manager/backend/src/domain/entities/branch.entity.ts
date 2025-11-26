export interface BranchProps {
    id?: number;
    companyId: number;
    code: string;
    name: string;
    address: string;
    department?: string | null;
    municipality?: string | null;
    phone?: string | null;
    email?: string | null;
    isHeadquarters: boolean;
    isActive: boolean;
    openingDate?: Date | null;
    createdAt?: Date;
}

export class Branch {
    constructor(public readonly props: BranchProps) { }

    get id(): number | undefined {
        return this.props.id;
    }

    get name(): string {
        return this.props.name;
    }

    get code(): string {
        return this.props.code;
    }

    get isHeadquarters(): boolean {
        return this.props.isHeadquarters;
    }
}
