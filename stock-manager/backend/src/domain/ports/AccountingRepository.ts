import { Account } from '../entities/Account';
import { AccountingPeriod } from '../entities/AccountingPeriod';
import { CostCenter } from '../entities/CostCenter';

export interface AccountingRepository {
    // Accounts
    findAllAccounts(): Promise<Account[]>;
    findAccountById(id: number): Promise<Account | null>;
    findAccountByCode(code: string): Promise<Account | null>;
    createAccount(account: Account): Promise<Account>;
    updateAccount(account: Account): Promise<Account>;

    // Cost Centers
    findAllCostCenters(): Promise<CostCenter[]>;
    createCostCenter(costCenter: CostCenter): Promise<CostCenter>;

    // Periods
    findPeriodByYearAndMonth(year: number, month: number): Promise<AccountingPeriod | null>;
    createPeriod(period: AccountingPeriod): Promise<AccountingPeriod>;
    closePeriod(id: number): Promise<void>;
}
