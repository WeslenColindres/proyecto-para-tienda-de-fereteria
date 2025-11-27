import { ReportRepository } from '../../domain/ports/ReportRepository';
import { ReportingRepository } from '../../domain/ports/ReportingRepository';
import { Report, ReportProps } from '../../domain/entities/Report';

export class ReportService {
    constructor(
        private readonly reportRepo: ReportRepository,
        private readonly reportingRepo: ReportingRepository
    ) { }

    async generateReport(props: ReportProps): Promise<Report> {
        // 1. Create report record with status PENDING/PROCESSING
        const report = new Report({
            ...props,
            status: 'PROCESANDO',
            createdAt: new Date()
        });
        const savedReport = await this.reportRepo.createReport(report);

        // 2. Trigger async generation (mocked here or handled by a job queue)
        // In a real app, we'd push to a queue. Here we might just return the pending report.
        // Or if we want to simulate async, we don't await the generation logic.

        return savedReport;
    }

    async getUserReports(userId: number): Promise<Report[]> {
        return this.reportRepo.findReportsByUserId(userId);
    }

    async getReport(id: number): Promise<Report | null> {
        return this.reportRepo.findReportById(id);
    }

    // New Reporting Methods
    async getSalesSummary(startDate?: Date, endDate?: Date) {
        return this.reportingRepo.getSalesSummary(startDate, endDate);
    }

    async getInventoryValuation() {
        return this.reportingRepo.getInventoryValuation();
    }

    async getTopProducts(limit?: number) {
        return this.reportingRepo.getTopProducts(limit);
    }

    async getAccountsReceivable() {
        return this.reportingRepo.getAccountsReceivable();
    }

    async getFinancialSummary(year: number, month: number) {
        return this.reportingRepo.getFinancialSummary(year, month);
    }

    async getInventoryMovements(limit?: number) {
        return this.reportingRepo.getInventoryMovements(limit);
    }
}
