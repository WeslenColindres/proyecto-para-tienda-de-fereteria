import { Router } from 'express';
import { PurchaseOrdersController } from '../controllers/purchase-orders.controller';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

router.get('/', PurchaseOrdersController.list);
router.get('/:id', PurchaseOrdersController.getById);
router.post('/', PurchaseOrdersController.create);
router.put('/:id', PurchaseOrdersController.update);
router.post('/:id/receive', PurchaseOrdersController.receive);
router.post('/:id/upload-invoice', upload.single('file'), PurchaseOrdersController.uploadInvoice);

export default router;
