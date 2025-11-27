import { ProductBatch } from '../entities/ProductBatch';
import { HistoricalPrice } from '../entities/HistoricalPrice';

export interface InventoryRepository {
    // Batches
    findBatchesByProductId(productId: number): Promise<ProductBatch[]>;
    createBatch(batch: ProductBatch): Promise<ProductBatch>;
    updateBatch(batch: ProductBatch): Promise<ProductBatch>;

    // Historical Prices
    findPriceHistoryByProductId(productId: number): Promise<HistoricalPrice[]>;
    createHistoricalPrice(price: HistoricalPrice): Promise<HistoricalPrice>;
}
