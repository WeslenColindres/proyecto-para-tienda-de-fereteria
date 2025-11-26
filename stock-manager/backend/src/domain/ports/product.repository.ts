import { Product } from '../entities/product.entity';
import { Stock } from '../entities/stock.entity';

export interface ProductRepository {
    findById(id: number): Promise<Product | null>;
    findBySku(sku: string): Promise<Product | null>;
    findAll(limit?: number, offset?: number): Promise<Product[]>;
    save(product: Product): Promise<Product>;
    update(product: Product): Promise<Product>;

    // Stock methods
    getStock(productId: number, branchId: number): Promise<Stock | null>;
    updateStock(stock: Stock): Promise<Stock>;
}
