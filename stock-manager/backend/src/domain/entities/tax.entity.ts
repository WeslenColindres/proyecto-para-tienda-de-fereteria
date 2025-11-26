export interface TaxProps {
    id?: number;
    code: string;
    name: string;
    percentage: number;
    appliesTo: string;
    isActive: boolean;
    validFrom: Date;
    validTo?: Date | null;
    createdAt?: Date;
}

export class Tax {
    constructor(public readonly props: TaxProps) { }

    get id(): number | undefined {
        return this.props.id;
    }

    get percentage(): number {
        return this.props.percentage;
    }
}
