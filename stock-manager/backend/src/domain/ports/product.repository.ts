import { Product } from '../entities/product.entity';
import { Stock } from '../entities/stock.entity';

export interface ProductRepository {
    findById(id: number): Promise<Product | null>;
    findBySku(sku: string): Promise<Product | null>;
    findAll(limit: number, offset: number, orderBy?: string, orderDir?: 'ASC' | 'DESC', filters?: any): Promise<{ products: Product[], total: number }>;
    save(product: Product): Promise<Product>;
    update(product: Product): Promise<Product>;
    updatePrice(productId: number, price: number): Promise<void>;

    // Stock methods
    getStock(productId: number, branchId: number): Promise<Stock | null>;
    updateStock(stock: Stock): Promise<Stock>;

    // Supplier methods
    addSupplier(productId: number, supplierId: number, cost: number, code?: string, isMain?: boolean): Promise<void>;
    removeSupplier(productId: number, supplierId: number): Promise<void>;
    getSuppliers(productId: number): Promise<any[]>; // TODO: Return ProductSupplier[]
    updateSupplierPrice(productId: number, supplierId: number, cost: number): Promise<void>;

    // Warehouse & Movement methods
    getWarehouses(): Promise<any[]>;
    createMovement(data: {
        productId: number;
        branchId: number;
        type: string;
        quantity: number;
        stockBefore: number;
        stockAfter: number;
        userId: number;
        reason: string;
        reference: string;
        documentType: string;
    }): Promise<void>;

    // Reporting methods
    getInventoryStats(): Promise<{
        value: number;
        productsWithStock: number;
        lowStock: number;
    }>;
    getWarehouseStats(): Promise<any[]>;
    getLowStockAlerts(): Promise<any[]>;
}
