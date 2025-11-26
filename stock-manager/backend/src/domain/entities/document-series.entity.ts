export interface DocumentSeriesProps {
    id?: number;
    branchId: number;
    documentType: string;
    series: string;
    currentCorrelative: number;
    startCorrelative: number;
    endCorrelative: number;
    authDate?: Date | null;
    expirationDate?: Date | null;
    isActive: boolean;
    createdAt?: Date;
}

export class DocumentSeries {
    constructor(public readonly props: DocumentSeriesProps) { }

    get id(): number | undefined {
        return this.props.id;
    }

    get series(): string {
        return this.props.series;
    }
}
