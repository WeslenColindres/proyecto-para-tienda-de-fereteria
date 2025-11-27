import { AccountingRepository } from '../../domain/ports/AccountingRepository';
import { Account, AccountProps } from '../../domain/entities/Account';
import { AccountingPeriod, AccountingPeriodProps } from '../../domain/entities/AccountingPeriod';

export class AccountingService {
    constructor(private readonly accountingRepo: AccountingRepository) { }

    async createAccount(props: AccountProps): Promise<Account> {
        const existing = await this.accountingRepo.findAccountByCode(props.code);
        if (existing) {
            throw new Error(`Account with code ${props.code} already exists`);
        }
        const account = new Account(props);
        return this.accountingRepo.createAccount(account);
    }

    async getChartOfAccounts(): Promise<Account[]> {
        return this.accountingRepo.findAllAccounts();
    }

    async openPeriod(year: number, month: number, name: string): Promise<AccountingPeriod> {
        const existing = await this.accountingRepo.findPeriodByYearAndMonth(year, month);
        if (existing) {
            throw new Error(`Period ${year}-${month} already exists`);
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const period = new AccountingPeriod({
            year,
            month,
            name,
            startDate,
            endDate,
            status: 'ABIERTO',
            isFiscalYearClosed: false
        });

        return this.accountingRepo.createPeriod(period);
    }

    async closePeriod(id: number): Promise<void> {
        await this.accountingRepo.closePeriod(id);
    }
}
