import { PostgresAccountingRepository } from '../infrastructure/repositories/PostgresAccountingRepository';
import { PostgresUserRepository } from '../infrastructure/repositories/PostgresUserRepository';
import { PostgresReportRepository } from '../infrastructure/repositories/PostgresReportRepository';
import { PostgresInventoryRepository } from '../infrastructure/repositories/PostgresInventoryRepository';
import { AccountingService } from '../application/services/AccountingService';
import { UserService } from '../application/services/UserService';
import { ReportService } from '../application/services/ReportService';
import { StockControlService } from '../application/services/StockControlService';

async function main() {
    console.log('Starting backend verification...');

    try {
        // 1. Verify Accounting Module
        console.log('Verifying Accounting Module...');
        const accountingRepo = new PostgresAccountingRepository();
        const accountingService = new AccountingService(accountingRepo);
        const accounts = await accountingService.getChartOfAccounts();
        console.log(`- Found ${accounts.length} accounts`);

        // 2. Verify User Module
        console.log('Verifying User Module...');
        const userRepo = new PostgresUserRepository();
        const userService = new UserService(userRepo);
        // Assuming we have some users or roles seeded
        const roles = await userRepo.findAllRoles();
        console.log(`- Found ${roles.length} roles`);

        // 3. Verify Report Module
        console.log('Verifying Report Module...');
        const reportRepo = new PostgresReportRepository();
        const reportService = new ReportService(reportRepo);
        const reports = await reportRepo.findAllReports();
        console.log(`- Found ${reports.length} reports`);

        // 4. Verify Stock Control Module
        console.log('Verifying Stock Control Module...');
        const inventoryRepo = new PostgresInventoryRepository();
        const stockService = new StockControlService(inventoryRepo);
        // Just check connection by querying something empty or existing
        // We can't easily check batches without a product ID, but we can try to find batches for a non-existent product
        const batches = await stockService.getProductBatches(999999);
        console.log(`- Query executed successfully (found ${batches.length} batches for dummy product)`);

        console.log('Verification completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
}

main();
