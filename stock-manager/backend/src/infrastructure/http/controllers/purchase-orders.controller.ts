import { Request, Response } from 'express';
import { PurchaseOrdersRepository } from '../../repositories/purchase-orders.repository';
import { PurchaseOrder } from '../../../domain/entities/PurchaseOrder';
import { fileStorageService } from '../../services/file-storage.service';
import { Money } from '../../../domain/value-objects/Money';

const mapOrderToFrontend = (order: PurchaseOrder) => ({
    id: order.id,
    orderNumber: order.props.orderNumber,
    supplierId: order.props.supplierId,
    branchId: order.props.branchId,
    userId: order.props.userId,
    date: order.props.date,
    expectedDeliveryDate: order.props.expectedDeliveryDate,
    actualDeliveryDate: order.props.actualDeliveryDate,
    status: order.props.status,
    items: order.props.items.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        unitCost: i.unitCost.amount,
        total: i.total.amount,
        receivedQuantity: i.receivedQuantity
    })),
    subtotal: order.props.subtotal.amount,
    tax: order.props.tax.amount,
    total: order.props.total.amount,
    notes: order.props.notes,
    receivedBy: order.props.receivedBy,
    receivedAt: order.props.receivedAt,
    invoiceDocumentUrl: order.props.invoiceDocumentUrl,
    createdAt: order.props.createdAt
});

export const PurchaseOrdersController = {
    list: async (req: Request, res: Response) => {
        try {
            const { page, pageSize, search, status, supplierId } = req.query;

            const result = await PurchaseOrdersRepository.findAll({
                page: page ? parseInt(page as string) : undefined,
                pageSize: pageSize ? parseInt(pageSize as string) : undefined,
                search: search as string,
                status: status as string,
                supplierId: supplierId as string
            });

            res.json({
                data: result.data.map(mapOrderToFrontend),
                total: result.total,
                page: result.page,
                pageSize: result.pageSize
            });
        } catch (error) {
            console.error('Error listing orders:', error);
            res.status(500).json({ message: 'Error al obtener órdenes' });
        }
    },

    getById: async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const order = await PurchaseOrdersRepository.findById(id);

            if (!order) {
                return res.status(404).json({ message: 'Orden no encontrada' });
            }

            res.json(mapOrderToFrontend(order));
        } catch (error) {
            console.error('Error getting order:', error);
            res.status(500).json({ message: 'Error al obtener orden' });
        }
    },

    create: async (req: Request, res: Response) => {
        try {
            const { supplierId, branchId, items, notes, expectedDeliveryDate } = req.body;
            const userId = (req as any).user?.id || '1'; // Placeholder

            // Generate order number (simple logic for now)
            const orderNumber = `OC-${Date.now()}`;

            const order = new PurchaseOrder({
                id: 'new',
                orderNumber,
                supplierId,
                branchId,
                userId,
                date: new Date(),
                expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : undefined,
                status: 'PENDIENTE',
                items: [],
                subtotal: Money.from(0),
                tax: Money.from(0),
                total: Money.from(0),
                notes,
                createdAt: new Date()
            });

            // Add items
            for (const item of items) {
                order.addItem(item.productId, item.quantity, item.unitCost);
            }

            await PurchaseOrdersRepository.save(order);

            // Fetch created
            const created = await PurchaseOrdersRepository.findByOrderNumber(orderNumber);
            if (!created) throw new Error('Error retrieving created order');

            res.status(201).json(mapOrderToFrontend(created));
        } catch (error: any) {
            console.error('Error creating order:', error);
            res.status(500).json({ message: 'Error al crear orden' });
        }
    },

    update: async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const data = req.body;

            const existing = await PurchaseOrdersRepository.findById(id);
            if (!existing) {
                return res.status(404).json({ message: 'Orden no encontrada' });
            }

            // Only allow updates if pending
            if (existing.props.status !== 'PENDIENTE') {
                return res.status(400).json({ message: 'No se puede modificar una orden que no está pendiente' });
            }

            // Rebuild order with new data (simplified)
            // Ideally should use domain methods to update
            // For now assuming full replacement of items if provided

            // ... implementation details for update ...
            // This is complex, for MVP maybe just allow updating notes/dates if not pending

            res.status(501).json({ message: 'Update not fully implemented yet' });
        } catch (error) {
            console.error('Error updating order:', error);
            res.status(500).json({ message: 'Error al actualizar orden' });
        }
    },

    receive: async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const { items } = req.body; // { productId, quantity }[]
            const userId = (req as any).user?.id || '1';

            const order = await PurchaseOrdersRepository.findById(id);
            if (!order) {
                return res.status(404).json({ message: 'Orden no encontrada' });
            }

            // Domain logic validation
            order.receiveOrder(userId, items);

            // Persist
            await PurchaseOrdersRepository.markAsReceived(id, userId, items);

            res.json({ success: true, message: 'Recepción registrada correctamente' });
        } catch (error: any) {
            console.error('Error receiving order:', error);
            res.status(500).json({ message: error.message || 'Error al recibir orden' });
        }
    },

    uploadInvoice: async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            if (!req.file) {
                return res.status(400).json({ message: 'No se ha subido ningún archivo' });
            }

            const fileUrl = await fileStorageService.uploadInvoice(req.file);

            // Update order with invoice URL
            // We need a method in repo for this or just update the field
            // For now assuming we can update the entity
            const order = await PurchaseOrdersRepository.findById(id);
            if (order) {
                order.props.invoiceDocumentUrl = fileUrl;
                await PurchaseOrdersRepository.save(order);
            }

            res.json({ fileUrl, message: 'Factura subida correctamente' });
        } catch (error: any) {
            console.error('Error uploading invoice:', error);
            res.status(500).json({ message: error.message || 'Error al subir factura' });
        }
    }
};
