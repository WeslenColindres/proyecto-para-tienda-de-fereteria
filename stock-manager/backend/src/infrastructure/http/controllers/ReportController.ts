import { Request, Response } from 'express';
import { ReportService } from '../../../application/services/ReportService';
import { PostgresReportRepository } from '../../repositories/PostgresReportRepository';
import { PostgresReportingRepository } from '../../repositories/PostgresReportingRepository';

const reportRepo = new PostgresReportRepository();
const reportingRepo = new PostgresReportingRepository();
const reportService = new ReportService(reportRepo, reportingRepo);

export class ReportController {
    async generateReport(req: Request, res: Response) {
        try {
            const report = await reportService.generateReport(req.body);
            res.status(201).json(report);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async getUserReports(req: Request, res: Response) {
        try {
            const userId = Number(req.params.userId);
            const reports = await reportService.getUserReports(userId);
            res.json(reports);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getReport(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            const report = await reportService.getReport(id);
            if (!report) {
                return res.status(404).json({ message: 'Report not found' });
            }
            res.json(report);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    // New Reporting Endpoints
    async getSalesSummary(req: Request, res: Response) {
        try {
            const { startDate, endDate } = req.query;
            const start = startDate ? new Date(startDate as string) : undefined;
            const end = endDate ? new Date(endDate as string) : undefined;
            const data = await reportService.getSalesSummary(start, end);
            res.json(data);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getInventoryValuation(req: Request, res: Response) {
        try {
            const data = await reportService.getInventoryValuation();
            res.json(data);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getTopProducts(req: Request, res: Response) {
        try {
            const limit = req.query.limit ? Number(req.query.limit) : 10;
            const data = await reportService.getTopProducts(limit);
            res.json(data);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getAccountsReceivable(req: Request, res: Response) {
        try {
            const data = await reportService.getAccountsReceivable();
            res.json(data);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getFinancialSummary(req: Request, res: Response) {
        try {
            const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
            const month = req.query.month ? Number(req.query.month) : new Date().getMonth() + 1;
            const data = await reportService.getFinancialSummary(year, month);
            res.json(data);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getInventoryMovements(req: Request, res: Response) {
        try {
            const limit = req.query.limit ? Number(req.query.limit) : 100;
            const data = await reportService.getInventoryMovements(limit);
            res.json(data);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}
