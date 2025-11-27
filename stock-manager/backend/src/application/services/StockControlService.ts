import { InventoryRepository } from '../../domain/ports/InventoryRepository';
import { ProductBatch, ProductBatchProps } from '../../domain/entities/ProductBatch';
import { HistoricalPrice, HistoricalPriceProps } from '../../domain/entities/HistoricalPrice';

export class StockControlService {
    constructor(private readonly inventoryRepo: InventoryRepository) { }

    async addBatch(props: ProductBatchProps): Promise<ProductBatch> {
        const batch = new ProductBatch(props);
        return this.inventoryRepo.createBatch(batch);
    }

    async getProductBatches(productId: number): Promise<ProductBatch[]> {
        return this.inventoryRepo.findBatchesByProductId(productId);
    }

    async updatePrice(props: HistoricalPriceProps): Promise<HistoricalPrice> {
        // 1. Record history
        const history = new HistoricalPrice(props);
        await this.inventoryRepo.createHistoricalPrice(history);

        // 2. Update actual product price (this would likely call ProductRepository too)
        // For now, we just record the history as per this service's scope.

        return history;
    }

    async getPriceHistory(productId: number): Promise<HistoricalPrice[]> {
        return this.inventoryRepo.findPriceHistoryByProductId(productId);
    }
}
