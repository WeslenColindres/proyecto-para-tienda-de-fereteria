import { ProductRepository } from '../../domain/ports/product.repository';
import { Product } from '../../domain/entities/product.entity';
import { Stock } from '../../domain/entities/stock.entity';

export class InventoryService {
    constructor(private readonly productRepository: ProductRepository) { }

    async getAllProducts(limit: number, offset: number, orderBy?: string, orderDir?: 'ASC' | 'DESC'): Promise<Product[]> {
        return this.productRepository.findAll(limit, offset, orderBy, orderDir);
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

    async getStock(productId: number, branchId: number): Promise<Stock | null> {
        return this.productRepository.getStock(productId, branchId);
    }

    async updateStock(productId: number, branchId: number, quantityChange: number): Promise<Stock> {
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

        return this.productRepository.updateStock(updatedStock);
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
