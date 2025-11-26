import { Product } from '../entities/Product';
import { SKU } from '../value-objects/SKU';

export interface IProductRepository {
    save(product: Product): Promise<void>;
    findBySku(sku: SKU): Promise<Product | null>;
    findById(id: string): Promise<Product | null>;
    findAll(filters?: any): Promise<Product[]>;
    count(): Promise<number>;
    delete(id: string): Promise<void>;
    saveBulk(products: Product[]): Promise<void>;
}
