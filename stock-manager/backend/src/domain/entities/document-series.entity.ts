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

    get currentCorrelative(): number {
        return this.props.currentCorrelative;
    }

    /**
     * Check if series can generate more documents
     */
    canGenerateDocument(): boolean {
        return (
            this.props.isActive &&
            this.props.currentCorrelative < this.props.endCorrelative &&
            (!this.props.expirationDate || new Date() <= this.props.expirationDate)
        );
    }

    /**
     * Get next document number
     */
    getNextDocumentNumber(): string {
        const nextCorrelative = this.props.currentCorrelative + 1;
        return `${this.props.series}-${nextCorrelative.toString().padStart(8, '0')}`;
    }

    /**
     * Increment correlative
     */
    incrementCorrelative(): void {
        if (!this.canGenerateDocument()) {
            throw new Error('No se pueden generar más documentos con esta serie');
        }
        (this.props as any).currentCorrelative += 1;
    }
}
