import { Request, Response } from 'express';
import path from 'path';
import { InventoryService } from '../../../application/services/inventory.service';
import { PostgresProductRepository } from '../../repositories/postgres-product.repository';
import { importExportService } from '../../services/import-export.service';

const productRepository = new PostgresProductRepository();
const inventoryService = new InventoryService(productRepository);

export class InventoryController {
    async getAllProducts(req: Request, res: Response) {
        try {
            const limit = Number(req.query.limit) || 20;
            const page = Number(req.query.page) || 1;
            const offset = (page - 1) * limit;
            const orderBy = req.query.orderBy as string;
            const orderDir = (req.query.orderDir as string) === 'ASC' ? 'ASC' : 'DESC';

            const filters = {
                search: req.query.search,
                categoryId: req.query.categoryId,
                stockState: req.query.stockState,
                status: req.query.status
            };

            const result = await inventoryService.getAllProducts(limit, offset, orderBy, orderDir, filters);
            res.json(result);
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

    async deleteProduct(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            await inventoryService.deleteProduct(id);
            res.json({ message: 'Product deleted successfully' });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async getProductMovements(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            const limit = Number(req.query.limit) || 10;
            const page = Number(req.query.page) || 1;
            const offset = (page - 1) * limit;

            const result = await inventoryService.getProductMovements(id, limit, offset);
            res.json({
                data: result.movements,
                total: result.total,
                page,
                limit
            });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async exportProducts(req: Request, res: Response) {
        try {
            const format = (req.query.format as 'xlsx' | 'csv') || 'xlsx';
            const filters = {
                search: req.query.search,
                categoryId: req.query.categoryId,
                stockState: req.query.stockState,
                status: req.query.status
            };
            const filePath = await importExportService.exportProducts(format, filters);
            res.download(path.join(process.cwd(), filePath));
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async exportTemplate(req: Request, res: Response) {
        try {
            const format = (req.query.format as 'xlsx' | 'csv') || 'xlsx';
            const filePath = await importExportService.exportProductTemplate(format);
            res.download(path.join(process.cwd(), filePath));
        } catch (error: any) {
            res.status(500).json({ message: error.message });
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
            const { branchId, quantityChange, reason, reference, type } = req.body;
            const userId = (req as any).user?.id; // Extract user ID from token

            if (!userId) {
                return res.status(401).json({ message: 'User identifier missing' });
            }

            const stock = await inventoryService.updateStock(
                productId,
                branchId,
                quantityChange,
                userId,
                reason,
                reference,
                type
            );
            res.json(stock);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async getWarehouses(req: Request, res: Response) {
        try {
            const warehouses = await inventoryService.getWarehouses();
            res.json(warehouses);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getOverview(req: Request, res: Response) {
        try {
            const overview = await inventoryService.getOverview();
            res.json(overview);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
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

    async importProducts(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'File is required' });
            }
            // Direct import: parse and process
            const parsed = await importExportService.parseProductFile(req.file.path, req.file.originalname);
            const userId = (req as any).user?.id || 'system';
            const result = await importExportService.processProductImport(parsed, userId);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async previewImport(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'File is required' });
            }
            const parsed = await importExportService.parseProductFile(req.file.path, req.file.originalname);
            res.json(parsed);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async confirmImport(req: Request, res: Response) {
        try {
            const { products } = req.body;
            const userId = (req as any).user?.id || 'system';
            const result = await importExportService.processProductImport(products, userId);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}
