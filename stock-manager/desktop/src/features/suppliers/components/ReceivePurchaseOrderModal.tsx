import { useState } from 'react';
import { PurchaseOrder, ReceiveOrderPayload } from '../types';
import { formatCurrency } from '@/shared/utils/format';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    order: PurchaseOrder;
    onSubmit: (id: string, data: ReceiveOrderPayload) => Promise<void>;
}

export const ReceivePurchaseOrderModal = ({ isOpen, onClose, order, onSubmit }: Props) => {
    const [loading, setLoading] = useState(false);
    const [receivedItems, setReceivedItems] = useState<{ productId: string, quantity: number }[]>(
        order.items.map(item => ({ productId: item.productId, quantity: item.quantity }))
    );

    const handleQuantityChange = (productId: string, qty: number) => {
        setReceivedItems(prev => prev.map(item =>
            item.productId === productId ? { ...item, quantity: qty } : item
        ));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(order.id, { items: receivedItems });
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <header className="modal-header">
                    <h3>Recibir Orden {order.orderNumber}</h3>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </header>

                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="items-section">
                        <table className="items-table">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Solicitado</th>
                                    <th>Recibido</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item) => {
                                    const received = receivedItems.find(r => r.productId === item.productId)?.quantity || 0;
                                    return (
                                        <tr key={item.productId}>
                                            <td>{item.productName || item.productId}</td>
                                            <td>{item.quantity}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={item.quantity}
                                                    value={received}
                                                    onChange={e => handleQuantityChange(item.productId, parseInt(e.target.value))}
                                                    style={{ width: '80px' }}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Procesando...' : 'Confirmar Recepción'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
