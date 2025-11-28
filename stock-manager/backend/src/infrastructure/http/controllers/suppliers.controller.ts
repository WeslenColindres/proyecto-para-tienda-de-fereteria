import { Request, Response } from 'express';
import { SuppliersRepository } from '../../repositories/suppliers.repository';
import { Supplier } from '../../../domain/entities/Supplier';
import { importExportService } from '../../services/import-export.service';
import { createSupplierSchema, updateSupplierSchema, supplierFilterSchema } from '../validators/suppliers.validator';
import { z } from 'zod';
import { WebsocketHub } from '../../realtime/websocketHub';

// Mapear de BD a formato frontend
const mapSupplierToFrontend = (supplier: Supplier) => ({
    id: supplier.id,
    nit: supplier.props.nit,
    name: supplier.props.name,
    commercialName: supplier.props.commercialName || '',
    contactName: supplier.props.contactName || '',
    phone: supplier.props.phone || '',
    email: supplier.props.email || '',
    cityId: supplier.props.cityId || '',
    cityName: supplier.props.cityName || '',
    categoryId: supplier.props.categoryId || '',
    categoryName: supplier.props.categoryName || '',
    address: supplier.props.address || '',
    creditDays: supplier.props.creditDays || 0,
    creditLimit: supplier.props.creditLimit || 0,
    status: supplier.props.status,
    balance: supplier.props.balance || 0,
    overdueDays: supplier.props.overdueDays || 0,
    paymentConditions: supplier.props.paymentConditions || '',
    version: supplier.props.version,
    updatedAt: supplier.props.updatedAt
});

export const SuppliersController = {
    list: async (req: Request, res: Response) => {
        try {
            const params = supplierFilterSchema.parse(req.query);

            const result = await SuppliersRepository.findAll({
                page: params.page,
                pageSize: params.pageSize,
                search: params.search,
                status: params.status,
                cityId: params.cityId,
                categoryId: params.categoryId,
                sortBy: params.sortBy,
                sortOrder: params.sortOrder
            });

            res.json({
                data: result.data.map(mapSupplierToFrontend),
                total: result.total,
                page: result.page,
                pageSize: result.pageSize,
                counters: result.counters
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ message: 'Parámetros inválidos', errors: (error as any).errors });
            }
            console.error('Error listing suppliers:', error);
            res.status(500).json({ message: 'Error al obtener proveedores' });
        }
    },

    getById: async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const supplier = await SuppliersRepository.findById(id);

            if (!supplier) {
                return res.status(404).json({ message: 'Proveedor no encontrado' });
            }

            res.json(mapSupplierToFrontend(supplier));
        } catch (error) {
            console.error('Error getting supplier:', error);
            res.status(500).json({ message: 'Error al obtener proveedor' });
        }
    },

    create: async (req: Request, res: Response) => {
        try {
            const data = createSupplierSchema.parse(req.body);
            const userId = (req as any).user?.id; // Assuming auth middleware

            const supplier = new Supplier({
                id: '', // New
                ...data,
                createdBy: userId,
                version: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            await SuppliersRepository.save(supplier);

            // Fetch created to return full object
            const created = await SuppliersRepository.findByNit(data.nit);
            if (!created) throw new Error('Error retrieving created supplier');

            const frontendSupplier = mapSupplierToFrontend(created);

            // Emit event
            try {
                WebsocketHub.getInstance().broadcast({
                    type: 'supplier.created',
                    payload: frontendSupplier
                });
            } catch (e) {
                console.error('Error emitting websocket event:', e);
            }

            res.status(201).json(frontendSupplier);
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ message: 'Datos inválidos', errors: (error as any).errors });
            }
            console.error('Error creating supplier:', error);

            if (error.code === '23505') {
                return res.status(409).json({ message: 'Ya existe un proveedor con ese NIT' });
            }

            res.status(500).json({ message: 'Error al crear proveedor' });
        }
    },

    update: async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const data = updateSupplierSchema.parse(req.body);
            const userId = (req as any).user?.id;

            const existing = await SuppliersRepository.findById(id);
            if (!existing) {
                return res.status(404).json({ message: 'Proveedor no encontrado' });
            }

            // Update props
            const updatedProps = {
                ...existing.props,
                ...data,
                id,
                updatedBy: userId
            };
            const supplier = new Supplier(updatedProps);

            await SuppliersRepository.save(supplier);

            // Fetch updated
            const updated = await SuppliersRepository.findById(id);
            if (!updated) throw new Error('Error retrieving updated supplier');

            const frontendSupplier = mapSupplierToFrontend(updated);

            // Emit event
            try {
                WebsocketHub.getInstance().broadcast({
                    type: 'supplier.updated',
                    payload: frontendSupplier
                });
            } catch (e) {
                console.error('Error emitting websocket event:', e);
            }

            res.json(frontendSupplier);
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ message: 'Datos inválidos', errors: (error as any).errors });
            }
            console.error('Error updating supplier:', error);

            if (error.code === 'SUPPLIER_VERSION_CONFLICT') {
                return res.status(409).json({
                    message: 'El proveedor ha sido modificado por otro usuario. Por favor, recargue y vuelva a intentar.',
                    code: 'VERSION_CONFLICT'
                });
            }

            if (error.code === '23505') {
                return res.status(409).json({ message: 'Ya existe un proveedor con ese NIT' });
            }

            res.status(500).json({ message: 'Error al actualizar proveedor' });
        }
    },

    delete: async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            await SuppliersRepository.softDelete(id);

            // Emit event
            try {
                WebsocketHub.getInstance().broadcast({
                    type: 'supplier.deleted',
                    payload: { id }
                });
            } catch (e) {
                console.error('Error emitting websocket event:', e);
            }

            res.json({ success: true, message: 'Proveedor eliminado correctamente' });
        } catch (error: any) {
            console.error('Error deleting supplier:', error);
            res.status(500).json({ message: 'Error al eliminar proveedor' });
        }
    },

    restore: async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            await SuppliersRepository.restore(id);

            // Fetch restored
            const restored = await SuppliersRepository.findById(id);
            if (restored) {
                // Emit event
                try {
                    WebsocketHub.getInstance().broadcast({
                        type: 'supplier.updated', // Or restored if we add it
                        payload: mapSupplierToFrontend(restored)
                    });
                } catch (e) {
                    console.error('Error emitting websocket event:', e);
                }
            }

            res.json({ success: true, message: 'Proveedor restaurado correctamente' });
        } catch (error: any) {
            console.error('Error restoring supplier:', error);
            res.status(500).json({ message: 'Error al restaurar proveedor' });
        }
    },

    catalogs: async (req: Request, res: Response) => {
        try {
            const catalogs = await SuppliersRepository.getCatalogs();
            res.json(catalogs);
        } catch (error) {
            console.error('Error getting catalogs:', error);
            res.status(500).json({ message: 'Error al obtener catálogos' });
        }
    },

    importSuppliers: async (req: Request, res: Response) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No se ha subido ningún archivo' });
            }

            const userId = (req as any).user?.id || '1';

            const jobId = await importExportService.importSuppliers(req.file.path, userId);
            res.json({ jobId, message: 'Importación iniciada' });
        } catch (error: any) {
            console.error('Error importing suppliers:', error);
            res.status(500).json({ message: error.message || 'Error al importar proveedores' });
        }
    },

    exportSuppliers: async (req: Request, res: Response) => {
        try {
            const format = req.query.format as 'xlsx' | 'csv' || 'xlsx';
            const filePath = await importExportService.exportSuppliers(format);

            res.download(filePath, (err) => {
                if (err) console.error('Error sending file:', err);
            });
        } catch (error: any) {
            console.error('Error exporting suppliers:', error);
            res.status(500).json({ message: 'Error al exportar proveedores' });
        }
    },

    getJobStatus: async (req: Request, res: Response) => {
        try {
            const jobId = req.params.jobId;
            const job = await importExportService.getJobStatus(jobId);
            if (!job) {
                return res.status(404).json({ message: 'Job no encontrado' });
            }
            res.json(job);
        } catch (error) {
            console.error('Error getting job status:', error);
            res.status(500).json({ message: 'Error al obtener estado del job' });
        }
    },

    purchases: async (req: Request, res: Response) => {
        try {
            // TODO: Implementar consulta de compras del proveedor
            res.json([]);
        } catch (error) {
            console.error('Error getting purchases:', error);
            res.status(500).json({ message: 'Error al obtener compras' });
        }
    },

    report: async (req: Request, res: Response) => {
        try {
            const { from, to } = req.query;
            const report = await SuppliersRepository.getReport({
                from: from as string,
                to: to as string
            });
            res.json(report);
        } catch (error) {
            console.error('Error getting report:', error);
            res.status(500).json({ message: 'Error al obtener reporte' });
        }
    }
};
