import { AccountsPayable } from '../entities/AccountsPayable';
import { Payment } from '../entities/Payment';

export interface AccountsPayableListResult {
    data: AccountsPayable[];
    total: number;
    page: number;
    pageSize: number;
}

export interface ListAccountsPayableParams {
    page?: number;
    pageSize?: number;
    supplierId?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
}

export interface AgingReport {
    range_0_30: number;
    range_31_60: number;
    range_61_90: number;
    range_90_plus: number;
    total: number;
}

export interface IAccountsPayableRepository {
    save(account: AccountsPayable): Promise<void>;
    findById(id: string): Promise<AccountsPayable | null>;
    findAll(params: ListAccountsPayableParams): Promise<AccountsPayableListResult>;
    findBySupplierId(supplierId: string): Promise<AccountsPayable[]>;
    findOverdue(): Promise<AccountsPayable[]>;
    registerPayment(accountId: string, payment: Payment): Promise<void>;
    getAgingReport(supplierId?: string): Promise<AgingReport>;
}
