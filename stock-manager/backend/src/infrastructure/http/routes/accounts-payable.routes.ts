import { Router } from 'express';
import { AccountsPayableController } from '../controllers/accounts-payable.controller';

const router = Router();

router.get('/', AccountsPayableController.list);
router.get('/aging-report', AccountsPayableController.getAgingReport);
router.get('/reports/aging', AccountsPayableController.getAgingReport);
router.post('/:id/payments', AccountsPayableController.registerPayment);

export default router;
