export interface ReportingRepository {
    getSalesSummary(startDate?: Date, endDate?: Date): Promise<any[]>;
    getInventoryValuation(): Promise<any[]>;
    getTopProducts(limit?: number): Promise<any[]>;
    getAccountsReceivable(): Promise<any[]>;
    getFinancialSummary(year: number, month: number): Promise<any[]>;
    getInventoryMovements(limit?: number): Promise<any[]>;
}
