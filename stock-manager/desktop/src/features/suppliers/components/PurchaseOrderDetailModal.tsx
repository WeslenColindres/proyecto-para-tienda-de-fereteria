import { useMemo } from 'react';
import { DataTable, type Column } from '@/ui/molecules/Table/DataTable';
import { PurchaseOrder } from '../types';
import { formatCurrency } from '@/shared/utils/format';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    order: PurchaseOrder | null;
}

export const PurchaseOrderDetailModal = ({ isOpen, onClose, order }: Props) => {
    const columns: Column<any>[] = useMemo(() => [
        { key: 'productName', header: 'Producto', accessor: (item) => item.productName || item.productId },
        { key: 'quantity', header: 'Cant.', accessor: 'quantity' },
        { key: 'unitCost', header: 'Costo Unit.', accessor: (item) => formatCurrency(item.unitCost) },
        { key: 'total', header: 'Total', accessor: (item) => formatCurrency(item.total) },
    ], []);

    if (!isOpen || !order) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <header className="modal-header">
                    <h3>Detalle de Orden {order.orderNumber}</h3>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </header>

                <div className="modal-body">
                    <div className="detail-grid">
                        <div>
                            <strong>Proveedor:</strong> {order.supplierName}
                        </div>
                        <div>
                            <strong>Fecha:</strong> {new Date(order.date).toLocaleDateString()}
                        </div>
                        <div>
                            <strong>Estado:</strong> <span className={`badge-status ${order.status.toLowerCase()}`}>{order.status}</span>
                        </div>
                        <div>
                            <strong>Entrega Esperada:</strong> {order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : '-'}
                        </div>
                    </div>

                    <h4 className="mt-4">Productos</h4>
                    <h4 className="mt-4">Productos</h4>
                    <DataTable
                        data={order.items}
                        columns={columns}
                        keyField="productId" // Assuming productId is unique in items
                        className="items-table"
                    />

                    <div className="mt-4 flex flex-col items-end gap-1">
                        <div className="flex justify-between w-48">
                            <strong>Subtotal:</strong>
                            <span>{formatCurrency(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between w-48">
                            <strong>Impuestos:</strong>
                            <span>{formatCurrency(order.tax)}</span>
                        </div>
                        <div className="flex justify-between w-48 text-lg">
                            <strong>Total:</strong>
                            <strong>{formatCurrency(order.total)}</strong>
                        </div>
                    </div>

                    {order.notes && (
                        <div className="mt-4">
                            <strong>Notas:</strong>
                            <p>{order.notes}</p>
                        </div>
                    )}

                    {order.invoiceDocumentUrl && (
                        <div className="mt-4">
                            <strong>Factura:</strong>
                            <a href={order.invoiceDocumentUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 underline">
                                Ver Documento
                            </a>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button onClick={onClose} className="btn-secondary">Cerrar</button>
                </div>
            </div>
        </div>
    );
};
