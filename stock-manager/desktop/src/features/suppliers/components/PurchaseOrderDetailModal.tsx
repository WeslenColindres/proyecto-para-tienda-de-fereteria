import { PurchaseOrder } from '../types';
import { formatCurrency } from '@/shared/utils/format';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    order: PurchaseOrder | null;
}

export const PurchaseOrderDetailModal = ({ isOpen, onClose, order }: Props) => {
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
                    <table className="items-table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Cant.</th>
                                <th>Costo Unit.</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, idx) => (
                                <tr key={idx}>
                                    <td>{item.productName || item.productId}</td>
                                    <td>{item.quantity}</td>
                                    <td>{formatCurrency(item.unitCost)}</td>
                                    <td>{formatCurrency(item.total)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={3} className="text-right"><strong>Subtotal:</strong></td>
                                <td>{formatCurrency(order.subtotal)}</td>
                            </tr>
                            <tr>
                                <td colSpan={3} className="text-right"><strong>Impuestos:</strong></td>
                                <td>{formatCurrency(order.tax)}</td>
                            </tr>
                            <tr>
                                <td colSpan={3} className="text-right"><strong>Total:</strong></td>
                                <td><strong>{formatCurrency(order.total)}</strong></td>
                            </tr>
                        </tfoot>
                    </table>

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
