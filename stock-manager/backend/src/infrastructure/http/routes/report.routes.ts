import { Router } from 'express';
import { ReportController } from '../controllers/ReportController';

const router = Router();
const controller = new ReportController();

router.post('/generate', controller.generateReport);
router.get('/user/:userId', controller.getUserReports);
router.get('/sales/daily', controller.getSalesSummary);
router.get('/inventory/valuation', controller.getInventoryValuation);
router.get('/products/top', controller.getTopProducts);
router.get('/finance/receivables', controller.getAccountsReceivable);
router.get('/finance/summary', controller.getFinancialSummary);
router.get('/inventory/movements', controller.getInventoryMovements);
router.get('/:id', controller.getReport);

export default router;
