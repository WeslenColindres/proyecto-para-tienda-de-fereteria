export interface CostCenterProps {
    id?: number;
    code: string;
    name: string;
    description?: string | null;
    branchId?: number | null;
    responsible?: string | null;
    isActive: boolean;
    createdAt?: Date;
}

export class CostCenter {
    constructor(public readonly props: CostCenterProps) { }

    get id(): number | undefined {
        return this.props.id;
    }

    get code(): string {
        return this.props.code;
    }

    get name(): string {
        return this.props.name;
    }

    get isActive(): boolean {
        return this.props.isActive;
    }

    toJSON(): CostCenterProps {
        return { ...this.props };
    }
}
