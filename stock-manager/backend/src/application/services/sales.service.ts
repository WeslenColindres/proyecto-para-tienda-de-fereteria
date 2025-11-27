import { SaleRepository } from '../../domain/ports/sale.repository';
import { SaleDetailRepository } from '../../domain/ports/sale-detail.repository';
import { ProductRepository } from '../../domain/ports/product.repository';
import { ClientService } from './client.service';
import { DocumentSeriesRepository } from '../../domain/ports/document-series.repository';
import { Sale } from '../../domain/entities/sale.entity';
import { SaleDetail } from '../../domain/entities/sale-detail.entity';
import { query } from '../../infrastructure/database/postgres';

interface CreateSaleData {
    docType: string; // 'FACTURA' | 'COMPROBANTE'
    clientName: string;
    clientNit: string;
    user: string;
    branchId?: number; // Default to 1 if not provided
    phone?: string;
}

interface SaleItem {
    productId: string;
    qty: number;
    price?: number; // Optional, will use product price if not provided
}

export class SalesService {
    constructor(
        private readonly saleRepository: SaleRepository,
        private readonly saleDetailRepository: SaleDetailRepository,
        private readonly productRepository: ProductRepository,
        private readonly clientService: ClientService,
        private readonly documentSeriesRepository: DocumentSeriesRepository
    ) { }

    /**
     * Create a complete sale with all validations and updates
     */
    async createSale(saleData: CreateSaleData, items: SaleItem[]): Promise<any> {
        // Validate items
        if (!items || items.length === 0) {
            throw new Error('La venta debe tener al menos un producto');
        }

        const branchId = saleData.branchId || 1; // Default branch

        // Start transaction
        const client = await query('BEGIN');

        try {
            // 1. Validate and prepare items with stock check
            const preparedItems: Array<{
                product: any;
                quantity: number;
                price: number;
                subtotal: number;
                tax: number;
                total: number;
            }> = [];

            let subtotal = 0;
            let totalTaxes = 0;

            for (const item of items) {
                // Get product
                const product = await this.productRepository.findById(Number(item.productId));
                if (!product) {
                    throw new Error(`Producto con ID ${item.productId} no encontrado`);
                }

                // Check stock availability
                const stockResult = await query(
                    `SELECT cantidad_disponible FROM stock_producto 
           WHERE id_producto = $1 AND id_sucursal = $2`,
                    [item.productId, branchId]
                );

                if (stockResult.rows.length === 0 || stockResult.rows[0].cantidad_disponible < item.qty) {
                    throw new Error(`Stock insuficiente para el producto: ${product.name}`);
                }

                // Calculate prices
                const unitPrice = item.price || product.price;
                const lineSubtotal = unitPrice * item.qty;
                const lineTax = lineSubtotal * 0.12; // IVA 12%
                const lineTotal = lineSubtotal;

                preparedItems.push({
                    product,
                    quantity: item.qty,
                    price: unitPrice,
                    subtotal: lineSubtotal,
                    tax: lineTax,
                    total: lineTotal,
                });

                subtotal += lineSubtotal;
                totalTaxes += lineTax;
            }

            const finalTotal = subtotal;

            // 2. Handle client
            let clientId: number | null = null;
            if (saleData.clientNit.toUpperCase() !== 'CF') {
                const client = await this.clientService.getOrCreateClient({
                    nit: saleData.clientNit,
                    name: saleData.clientName,
                    phone: saleData.phone,
                });
                clientId = client?.id || null;
            }

            // 3. Get active document series
            const series = await this.documentSeriesRepository.getActiveSeries(
                branchId,
                saleData.docType
            );

            if (!series) {
                throw new Error(`No hay series activas para el tipo de documento: ${saleData.docType}`);
            }

            if (!series.canGenerateDocument()) {
                throw new Error('La serie no puede generar más documentos');
            }

            const documentNumber = series.getNextDocumentNumber();

            // 4. Create sale
            const sale = new Sale({
                branchId,
                seriesId: series.id!,
                documentNumber,
                documentType: saleData.docType,
                clientId,
                sellerId: null, // TODO: Get from authenticated user
                subtotal: subtotal - totalTaxes,
                totalDiscounts: 0,
                totalTaxes,
                finalTotal,
                status: 'CERTIFICADA', // For now, mark as certified immediately
                requiresCertification: saleData.docType === 'FACTURA',
                certificationAttempts: 0,
                saleDate: new Date(),
            });

            const savedSale = await this.saleRepository.save(sale);

            // 5. Create sale details
            const saleDetails: SaleDetail[] = [];
            for (let i = 0; i < preparedItems.length; i++) {
                const item = preparedItems[i];
                const detail = new SaleDetail({
                    saleId: savedSale.id!,
                    lineNumber: i + 1,
                    productId: Number(item.product.id),
                    description: item.product.name,
                    quantity: item.quantity,
                    unitPrice: item.price,
                    discountPercentage: 0,
                    discountAmount: 0,
                    lineSubtotal: item.subtotal,
                    lineTaxTotal: item.tax,
                    lineTotal: item.total,
                    unitCostAtTime: item.product.cost || 0,
                });
                saleDetails.push(detail);
            }

            await this.saleDetailRepository.saveAll(savedSale.id!, saleDetails);

            // 6. Update stock and create kardex entries
            for (const item of preparedItems) {
                // Update stock
                await query(
                    `UPDATE stock_producto 
           SET cantidad_disponible = cantidad_disponible - $1,
               fecha_ultima_actualizacion = CURRENT_TIMESTAMP
           WHERE id_producto = $2 AND id_sucursal = $3`,
                    [item.quantity, item.product.id, branchId]
                );

                // Get current stock for kardex
                const stockResult = await query(
                    `SELECT cantidad_disponible FROM stock_producto 
           WHERE id_producto = $1 AND id_sucursal = $2`,
                    [item.product.id, branchId]
                );
                const newStock = stockResult.rows[0].cantidad_disponible;
                const previousStock = newStock + item.quantity;

                // Create kardex entry
                await query(
                    `INSERT INTO kardex_inventario (
            id_producto, id_sucursal, id_tipo_movimiento, documento_origen,
            id_documento_origen, numero_documento, cantidad, costo_unitario,
            costo_total, stock_anterior, stock_nuevo, motivo
           ) VALUES (
            $1, $2, 
            (SELECT id_tipo_movimiento FROM tipos_movimiento WHERE codigo = 'VENTA'),
            'VENTA', $3, $4, $5, $6, $7, $8, $9, $10
           )`,
                    [
                        item.product.id,
                        branchId,
                        savedSale.id,
                        documentNumber,
                        item.quantity,
                        item.product.cost || 0,
                        (item.product.cost || 0) * item.quantity,
                        previousStock,
                        newStock,
                        `Venta ${documentNumber}`,
                    ]
                );
            }

            // 7. Increment series correlative
            await this.documentSeriesRepository.incrementCorrelative(series.id!);

            // Commit transaction
            await query('COMMIT');

            // Return formatted response
            return {
                id: savedSale.id,
                docNumber: documentNumber,
                docType: saleData.docType,
                datetime: savedSale.props.saleDate,
                clientName: saleData.clientName,
                clientNit: saleData.clientNit,
                user: saleData.user,
                items: saleDetails.map((d) => ({
                    productId: d.props.productId,
                    code: preparedItems.find((p) => p.product.id === d.props.productId)?.product.code || '',
                    name: d.props.description,
                    qty: d.props.quantity,
                    price: d.props.unitPrice,
                    subtotal: d.props.lineTotal,
                })),
                subtotal: savedSale.props.subtotal,
                tax: savedSale.props.totalTaxes,
                total: savedSale.props.finalTotal,
                status: savedSale.props.status,
            };
        } catch (error) {
            // Rollback transaction on error
            await query('ROLLBACK');
            throw error;
        }
    }

    async getSaleById(id: number): Promise<Sale | null> {
        return this.saleRepository.findById(id);
    }

    async getSales(params: any): Promise<{ sales: any[]; total: number }> {
        const { sales, total } = await this.saleRepository.findAll(params);
        return {
            sales: sales.map((s) => ({
                id: s.id,
                documentNumber: s.documentNumber,
                saleDate: s.props.saleDate,
                clientName: 'Cliente Final', // TODO: Fetch client name
                total: s.finalTotal,
                status: s.props.status,
                documentType: s.props.documentType,
            })),
            total,
        };
    }
}
