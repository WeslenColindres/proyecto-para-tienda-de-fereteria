import { Request, Response } from 'express';
import { SuppliersRepository } from '../../repositories/suppliers.repository';
import { Supplier } from '../../../domain/entities/Supplier';
import { importExportService } from '../../services/import-export.service';

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
    overdueDays: supplier.props.overdueDays || 0
});

export const SuppliersController = {
    list: async (req: Request, res: Response) => {
        try {
            const { page, pageSize, search, status, cityId, categoryId, sortBy, sortOrder } = req.query;

            const result = await SuppliersRepository.findAll({
                page: page ? parseInt(page as string) : undefined,
                pageSize: pageSize ? parseInt(pageSize as string) : undefined,
                search: search as string,
                status: status as any,
                cityId: cityId as string,
                categoryId: categoryId as string,
                sortBy: sortBy as any,
                sortOrder: sortOrder as any
            });

            res.json({
                data: result.data.map(mapSupplierToFrontend),
                total: result.total,
                page: result.page,
                pageSize: result.pageSize,
                counters: result.counters
            });
        } catch (error) {
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
            const { nit, name, contactName, phone, email, address, creditDays, creditLimit, cityId, categoryId } = req.body;

            // Validación básica
            if (!nit || !name) {
                return res.status(400).json({ message: 'NIT y nombre son requeridos' });
            }

            const supplier = new Supplier({
                id: '', // New
                nit,
                name,
                commercialName: name, // Default to name if not provided separately
                contactName,
                phone,
                email,
                address,
                cityId,
                categoryId,
                creditDays: creditDays || 0,
                creditLimit: creditLimit || 0,
                status: 'activo',
                createdAt: new Date(),
                updatedAt: new Date()
            });

            await SuppliersRepository.save(supplier);

            // Fetch created to return full object
            const created = await SuppliersRepository.findByNit(nit);
            if (!created) throw new Error('Error retrieving created supplier');

            res.status(201).json(mapSupplierToFrontend(created));
        } catch (error: any) {
            console.error('Error creating supplier:', error);

            // Manejar error de NIT duplicado
            if (error.code === '23505') {
                return res.status(409).json({ message: 'Ya existe un proveedor con ese NIT' });
            }

            res.status(500).json({ message: 'Error al crear proveedor' });
        }
    },

    update: async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const data = req.body;

            const existing = await SuppliersRepository.findById(id);
            if (!existing) {
                return res.status(404).json({ message: 'Proveedor no encontrado' });
            }

            // Update props
            const updatedProps = { ...existing.props, ...data, id };
            const supplier = new Supplier(updatedProps);

            await SuppliersRepository.save(supplier);

            res.json(mapSupplierToFrontend(supplier));
        } catch (error: any) {
            console.error('Error updating supplier:', error);

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

            // Assuming user ID is available in req.user (middleware)
            // For now using a placeholder or getting from body if auth not fully set up
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

            // Send file for download
            res.download(filePath, (err) => {
                if (err) console.error('Error sending file:', err);
                // Optional: delete file after send? Maybe keep for history.
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
    }
};
