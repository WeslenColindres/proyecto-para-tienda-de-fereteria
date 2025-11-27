import { Router } from 'express';
import { StockControlController } from '../controllers/StockControlController';

const router = Router();
const controller = new StockControlController();

router.post('/batches', controller.addBatch);
router.get('/products/:productId/batches', controller.getProductBatches);
router.post('/price-history', controller.updatePrice);
router.get('/products/:productId/price-history', controller.getPriceHistory);

export default router;
