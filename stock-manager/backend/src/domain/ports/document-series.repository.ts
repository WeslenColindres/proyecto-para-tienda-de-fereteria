import { DocumentSeries } from '../entities/document-series.entity';

export interface DocumentSeriesRepository {
    findById(id: number): Promise<DocumentSeries | null>;
    getActiveSeries(branchId: number, documentType: string): Promise<DocumentSeries | null>;
    incrementCorrelative(seriesId: number): Promise<void>;
    save(series: DocumentSeries): Promise<DocumentSeries>;
    update(series: DocumentSeries): Promise<DocumentSeries>;
}
