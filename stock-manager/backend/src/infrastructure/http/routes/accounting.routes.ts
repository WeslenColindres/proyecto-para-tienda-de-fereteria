import { Router } from 'express';
import { AccountingController } from '../controllers/AccountingController';

const router = Router();
const controller = new AccountingController();

router.get('/accounts', controller.getChartOfAccounts);
router.post('/accounts', controller.createAccount);
router.post('/periods', controller.openPeriod);
router.put('/periods/:id/close', controller.closePeriod);

export default router;
