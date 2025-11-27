export type ReportFormat = 'PDF' | 'EXCEL' | 'CSV' | 'JSON';
export type ReportStatus = 'PENDIENTE' | 'PROCESANDO' | 'COMPLETADO' | 'FALLIDO';

export interface ReportProps {
    id?: number;
    name: string;
    description?: string | null;
    type: string; // e.g., 'SALES_BY_DATE', 'INVENTORY_VALUATION'
    format: ReportFormat;
    parameters: Record<string, any>;
    status: ReportStatus;
    filePath?: string | null;
    fileSize?: number | null;
    generatedByUserId: number;
    errorMessage?: string | null;
    createdAt?: Date;
    completedAt?: Date;
}

export class Report {
    constructor(public readonly props: ReportProps) { }

    get id(): number | undefined {
        return this.props.id;
    }

    get name(): string {
        return this.props.name;
    }

    get status(): ReportStatus {
        return this.props.status;
    }

    get isCompleted(): boolean {
        return this.props.status === 'COMPLETADO';
    }

    get isFailed(): boolean {
        return this.props.status === 'FALLIDO';
    }

    toJSON(): ReportProps {
        return { ...this.props };
    }
}
