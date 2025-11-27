import { Request, Response } from 'express';
import { InventoryService } from '../../../application/services/inventory.service';
import { PostgresProductRepository } from '../../repositories/postgres-product.repository';

const productRepository = new PostgresProductRepository();
const inventoryService = new InventoryService(productRepository);

export class InventoryController {
    async getAllProducts(req: Request, res: Response) {
        try {
            const limit = Number(req.query.limit) || 20;
            const offset = Number(req.query.offset) || 0;
            const products = await inventoryService.getAllProducts(limit, offset);
            res.json(products);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getProductById(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            const product = await inventoryService.getProductById(id);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.json(product);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async createProduct(req: Request, res: Response) {
        try {
            const product = await inventoryService.createProduct(req.body);
            res.status(201).json(product);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async updateProduct(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            const product = await inventoryService.updateProduct(id, req.body);
            res.json(product);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async getStock(req: Request, res: Response) {
        try {
            const productId = Number(req.params.productId);
            const branchId = Number(req.query.branchId) || 1; // Default to branch 1
            const stock = await inventoryService.getStock(productId, branchId);
            res.json(stock || { quantityAvailable: 0 });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateStock(req: Request, res: Response) {
        try {
            const productId = Number(req.params.productId);
            const { branchId, quantityChange } = req.body;
            const stock = await inventoryService.updateStock(productId, branchId, quantityChange);
            res.json(stock);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async addSupplier(req: Request, res: Response) {
        try {
            const productId = Number(req.params.id);
            const { supplierId, cost, code, isMain } = req.body;
            await inventoryService.addSupplier(productId, supplierId, cost, code, isMain);
            res.status(201).json({ message: 'Supplier added successfully' });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async removeSupplier(req: Request, res: Response) {
        try {
            const productId = Number(req.params.id);
            const supplierId = Number(req.params.supplierId);
            await inventoryService.removeSupplier(productId, supplierId);
            res.json({ message: 'Supplier removed successfully' });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async getSuppliers(req: Request, res: Response) {
        try {
            const productId = Number(req.params.id);
            const suppliers = await inventoryService.getSuppliers(productId);
            res.json(suppliers);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateSupplierPrice(req: Request, res: Response) {
        try {
            const productId = Number(req.params.id);
            const supplierId = Number(req.params.supplierId);
            const { price } = req.body;
            await inventoryService.updateSupplierPrice(productId, supplierId, price);
            res.json({ message: 'Supplier price updated successfully' });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}
