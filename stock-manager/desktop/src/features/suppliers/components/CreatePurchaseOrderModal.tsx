import { useState, useEffect } from 'react';
import { useSuppliers } from '../hooks/useSuppliers';
import { productsApi } from '@/shared/api/products';
import { CreatePurchaseOrderPayload } from '../types';
import { formatCurrency } from '@/shared/utils/format';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreatePurchaseOrderPayload) => Promise<void>;
}

interface ProductItem {
    id: string;
    name: string;
    cost: number;
}

export const CreatePurchaseOrderModal = ({ isOpen, onClose, onSubmit }: Props) => {
    const { suppliers } = useSuppliers();
    const [products, setProducts] = useState<ProductItem[]>([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<CreatePurchaseOrderPayload>({
        supplierId: '',
        branchId: '1', // Default branch
        items: [],
        notes: '',
        expectedDeliveryDate: ''
    });

    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [cost, setCost] = useState(0);

    useEffect(() => {
        if (isOpen) {
            loadProducts();
        }
    }, [isOpen]);

    const loadProducts = async () => {
        try {
            const result = await productsApi.list({ pageSize: 100 });
            setProducts(result.data.map((p: any) => ({ id: p.id, name: p.name, cost: p.cost || 0 })));
        } catch (error) {
            console.error('Error loading products', error);
        }
    };

    const handleAddItem = () => {
        if (!selectedProduct || quantity <= 0) return;

        const product = products.find(p => p.id === selectedProduct);
        if (!product) return;

        setFormData(prev => ({
            ...prev,
            items: [
                ...prev.items,
                { productId: selectedProduct, quantity, unitCost: cost || product.cost }
            ]
        }));

        setSelectedProduct('');
        setQuantity(1);
        setCost(0);
    };

    const handleRemoveItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const total = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <header className="modal-header">
                    <h3>Nueva Orden de Compra</h3>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </header>

                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-group">
                        <label>Proveedor</label>
                        <select
                            value={formData.supplierId}
                            onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
                            required
                        >
                            <option value="">Seleccionar Proveedor</option>
                            {suppliers.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Fecha Entrega Esperada</label>
                            <input
                                type="date"
                                value={formData.expectedDeliveryDate}
                                onChange={e => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="items-section">
                        <h4>Productos</h4>
                        <div className="add-item-form">
                            <select
                                value={selectedProduct}
                                onChange={e => {
                                    setSelectedProduct(e.target.value);
                                    const p = products.find(prod => prod.id === e.target.value);
                                    if (p) setCost(p.cost);
                                }}
                            >
                                <option value="">Seleccionar Producto</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={e => setQuantity(parseInt(e.target.value))}
                                placeholder="Cant."
                                style={{ width: '80px' }}
                            />
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={cost}
                                onChange={e => setCost(parseFloat(e.target.value))}
                                placeholder="Costo"
                                style={{ width: '100px' }}
                            />
                            <button type="button" onClick={handleAddItem} disabled={!selectedProduct}>Agregar</button>
                        </div>

                        <table className="items-table">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Cant.</th>
                                    <th>Costo</th>
                                    <th>Total</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {formData.items.map((item, idx) => {
                                    const product = products.find(p => p.id === item.productId);
                                    return (
                                        <tr key={idx}>
                                            <td>{product?.name || item.productId}</td>
                                            <td>{item.quantity}</td>
                                            <td>{formatCurrency(item.unitCost)}</td>
                                            <td>{formatCurrency(item.quantity * item.unitCost)}</td>
                                            <td>
                                                <button type="button" onClick={() => handleRemoveItem(idx)} className="text-red">&times;</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={3} className="text-right"><strong>Total:</strong></td>
                                    <td><strong>{formatCurrency(total)}</strong></td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="form-group">
                        <label>Notas</label>
                        <textarea
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                        <button type="submit" className="btn-primary" disabled={loading || !formData.supplierId || formData.items.length === 0}>
                            {loading ? 'Creando...' : 'Crear Orden'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
