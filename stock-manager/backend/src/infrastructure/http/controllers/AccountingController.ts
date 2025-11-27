import { Request, Response } from 'express';
import { AccountingService } from '../../../application/services/AccountingService';
import { PostgresAccountingRepository } from '../../repositories/PostgresAccountingRepository';

const accountingRepo = new PostgresAccountingRepository();
const accountingService = new AccountingService(accountingRepo);

export class AccountingController {
    async getChartOfAccounts(req: Request, res: Response) {
        try {
            const accounts = await accountingService.getChartOfAccounts();
            res.json(accounts);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async createAccount(req: Request, res: Response) {
        try {
            const account = await accountingService.createAccount(req.body);
            res.status(201).json(account);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async openPeriod(req: Request, res: Response) {
        try {
            const { year, month, name } = req.body;
            const period = await accountingService.openPeriod(year, month, name);
            res.status(201).json(period);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async closePeriod(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            await accountingService.closePeriod(id);
            res.json({ message: 'Period closed successfully' });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}
