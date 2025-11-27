import { ProductRepository } from '../../domain/ports/product.repository';
import { Product } from '../../domain/entities/product.entity';
import { Stock } from '../../domain/entities/stock.entity';

export class InventoryService {
    constructor(private readonly productRepository: ProductRepository) { }

    async getAllProducts(limit: number, offset: number, orderBy?: string, orderDir?: 'ASC' | 'DESC', filters?: any): Promise<any> {
        const { products, total } = await this.productRepository.findAll(limit, offset, orderBy, orderDir, filters);

        const mappedProducts = products.map(p => ({
            id: String(p.id),
            code: p.sku,
            name: p.name,
            description: p.props.description,
            categoryId: String(p.props.categoryId),
            categoryName: p.props.categoryName || 'General',
            barcode: p.props.barcode,
            cost: p.cost,
            price: p.price,
            stock: p.stock,
            unit: 'unidad', // TODO: Fetch unit
            minStock: 5, // TODO: Fetch min stock
            status: p.props.isActive ? 'activo' : 'inactivo',
            tax: 12
        }));

        return {
            data: mappedProducts,
            page: Math.floor(offset / limit) + 1,
            pageSize: limit,
            total,
            chunks: [],
            counters: {
                critical: 0,
                low: 0,
                preventive: 0
            }
        };
    }

    async getProductById(id: number): Promise<Product | null> {
        return this.productRepository.findById(id);
    }

    async createProduct(productData: any): Promise<Product> {
        const product = new Product({
            ...productData,
            isActive: true,
            isInventoriable: true,
        });
        return this.productRepository.save(product);
    }

    async updateProduct(id: number, productData: any): Promise<Product> {
        const existingProduct = await this.productRepository.findById(id);
        if (!existingProduct) {
            throw new Error('Product not found');
        }
        const updatedProduct = new Product({
            ...existingProduct.props,
            ...productData,
            id: existingProduct.id,
        });
        return this.productRepository.update(updatedProduct);
    }

    async deleteProduct(id: number): Promise<void> {
        return this.productRepository.delete(id);
    }

    async getProductMovements(productId: number, limit: number, offset: number): Promise<{ movements: any[], total: number }> {
        return this.productRepository.getMovements(productId, limit, offset);
    }

    async getStock(productId: number, branchId: number): Promise<Stock | null> {
        return this.productRepository.getStock(productId, branchId);
    }

    async updateStock(
        productId: number,
        branchId: number,
        quantityChange: number,
        userId: number,
        reason?: string,
        reference?: string,
        type?: string
    ): Promise<Stock> {
        let stock = await this.productRepository.getStock(productId, branchId);
        if (!stock) {
            stock = new Stock({
                productId,
                branchId,
                quantityAvailable: 0,
                quantityReserved: 0,
                quantityInTransit: 0,
            });
        }

        const newQuantity = Number(stock.quantityAvailable) + Number(quantityChange);
        if (newQuantity < 0) {
            throw new Error('Insufficient stock');
        }

        const updatedStock = new Stock({
            ...stock.props,
            quantityAvailable: newQuantity,
        });

        const savedStock = await this.productRepository.updateStock(updatedStock);

        // Log movement in Kardex
        await this.productRepository.createMovement({
            productId,
            branchId,
            type: type || (quantityChange >= 0 ? 'AJUSTE_ENTRADA' : 'AJUSTE_SALIDA'),
            quantity: Math.abs(quantityChange),
            stockBefore: stock.quantityAvailable,
            stockAfter: newQuantity,
            userId,
            reason: reason || 'Ajuste de stock manual',
            reference: reference || 'Manual',
            documentType: 'AJUSTE'
        });

        return savedStock;
    }

    async getWarehouses(): Promise<any[]> {
        return this.productRepository.getWarehouses();
    }

    async getOverview(): Promise<any> {
        const stats = await this.productRepository.getInventoryStats();
        const warehouseStats = await this.productRepository.getWarehouseStats();
        const alerts = await this.productRepository.getLowStockAlerts();

        // Get product details (reusing findAll but we might need a specific query for the report detail)
        // For now, let's fetch top 50 products to show in the detail list
        const { products } = await this.productRepository.findAll(50, 0, 'stock', 'ASC');

        const detail = products.map(p => ({
            product: p.name,
            stock: p.stock,
            value: p.price * p.stock,
            last: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : '-',
            rotation: 'Baja', // Placeholder
            warehouse: 'Principal' // Placeholder, ideally we'd join with stock table to get warehouse name per row
        }));

        // Calculate percentages for warehouses
        const totalValue = warehouseStats.reduce((sum, w) => sum + Number(w.value), 0);
        const warehouses = warehouseStats.map(w => ({
            ...w,
            percentage: totalValue > 0 ? Math.round((Number(w.value) / totalValue) * 100) : 0
        }));

        return {
            overview: {
                inventoryValue: stats.value,
                productsWithStock: stats.productsWithStock.toString(),
                lowStock: stats.lowStock.toString(),
                rotation: '12%' // Placeholder
            },
            detail,
            warehouses,
            alerts
        };
    }

    async addSupplier(productId: number, supplierId: number, cost: number, code?: string, isMain: boolean = false): Promise<void> {
        return this.productRepository.addSupplier(productId, supplierId, cost, code, isMain);
    }

    async removeSupplier(productId: number, supplierId: number): Promise<void> {
        return this.productRepository.removeSupplier(productId, supplierId);
    }

    async getSuppliers(productId: number): Promise<any[]> {
        return this.productRepository.getSuppliers(productId);
    }

    async updateSupplierPrice(productId: number, supplierId: number, price: number): Promise<void> {
        return this.productRepository.updateSupplierPrice(productId, supplierId, price);
    }
}
