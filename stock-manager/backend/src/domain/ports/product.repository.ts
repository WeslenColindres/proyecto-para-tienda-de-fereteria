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

    // Supplier methods
    addSupplier(productId: number, supplierId: number, cost: number, code?: string, isMain?: boolean): Promise<void>;
    removeSupplier(productId: number, supplierId: number): Promise<void>;
    getSuppliers(productId: number): Promise<any[]>; // TODO: Return ProductSupplier[]
    updateSupplierPrice(productId: number, supplierId: number, cost: number): Promise<void>;
}
