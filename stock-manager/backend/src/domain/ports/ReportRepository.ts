import { Report } from '../entities/Report';

export interface ReportRepository {
    findAllReports(): Promise<Report[]>;
    findReportsByUserId(userId: number): Promise<Report[]>;
    findReportById(id: number): Promise<Report | null>;
    createReport(report: Report): Promise<Report>;
    updateReport(report: Report): Promise<Report>;
}
