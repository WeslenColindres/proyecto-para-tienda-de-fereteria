import React, { useState, useEffect } from 'react';
import { inventoryApi } from '@/shared/api/inventory';

interface StockAdjustmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    product: { id: number; name: string } | null;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    product,
}) => {
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [branchId, setBranchId] = useState<number | ''>('');
    const [type, setType] = useState<'ENTRADA' | 'SALIDA'>('ENTRADA');
    const [quantity, setQuantity] = useState<string>('');
    const [reason, setReason] = useState('');
    const [reference, setReference] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadWarehouses();
            // Reset form
            setBranchId('');
            setType('ENTRADA');
            setQuantity('');
            setReason('');
            setReference('');
        }
    }, [isOpen]);

    const loadWarehouses = async () => {
        try {
            setLoading(true);
            const data = await inventoryApi.getWarehouses();
            setWarehouses(data);
            if (data.length > 0) {
                setBranchId(data[0].id);
            }
        } catch (error) {
            console.error('Error loading warehouses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product || !branchId || !quantity) return;

        try {
            setSubmitting(true);
            const qty = Number(quantity);
            const finalQty = type === 'ENTRADA' ? qty : -qty;

            await inventoryApi.updateStock(product.id, {
                branchId,
                quantityChange: finalQty,
                reason,
                reference,
                type: type === 'ENTRADA' ? 'AJUSTE_ENTRADA' : 'AJUSTE_SALIDA'
            });

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error updating stock:', error);
            alert('Error al actualizar stock');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content slide-in-right"
                onClick={e => e.stopPropagation()}
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    height: '100vh',
                    width: '400px',
                    background: 'var(--bg-card, #fff)',
                    boxShadow: '-4px 0 15px rgba(0,0,0,0.1)',
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 1000,
                    animation: 'slideInRight 0.3s ease-out'
                }}
            >
                <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0 }}>Ajustar Stock</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                </header>

                {product && (
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-hover, #f5f5f5)', borderRadius: '8px' }}>
                        <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted, #666)' }}>Producto</strong>
                        <span style={{ fontSize: '1.1rem' }}>{product.name}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Almacén</label>
                        <select
                            value={branchId}
                            onChange={e => setBranchId(Number(e.target.value))}
                            required
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid var(--border-color, #ddd)' }}
                        >
                            <option value="" disabled>Seleccionar almacén</option>
                            {warehouses.map(w => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Tipo de Movimiento</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <label style={{
                                flex: 1,
                                padding: '0.8rem',
                                border: `1px solid ${type === 'ENTRADA' ? 'var(--primary-color, #007bff)' : 'var(--border-color, #ddd)'}`,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                textAlign: 'center',
                                background: type === 'ENTRADA' ? 'var(--primary-light, #e7f1ff)' : 'transparent',
                                color: type === 'ENTRADA' ? 'var(--primary-color, #007bff)' : 'inherit'
                            }}>
                                <input
                                    type="radio"
                                    name="type"
                                    value="ENTRADA"
                                    checked={type === 'ENTRADA'}
                                    onChange={() => setType('ENTRADA')}
                                    style={{ display: 'none' }}
                                />
                                Entrada (+)
                            </label>
                            <label style={{
                                flex: 1,
                                padding: '0.8rem',
                                border: `1px solid ${type === 'SALIDA' ? 'var(--danger-color, #dc3545)' : 'var(--border-color, #ddd)'}`,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                textAlign: 'center',
                                background: type === 'SALIDA' ? 'var(--danger-light, #ffeef0)' : 'transparent',
                                color: type === 'SALIDA' ? 'var(--danger-color, #dc3545)' : 'inherit'
                            }}>
                                <input
                                    type="radio"
                                    name="type"
                                    value="SALIDA"
                                    checked={type === 'SALIDA'}
                                    onChange={() => setType('SALIDA')}
                                    style={{ display: 'none' }}
                                />
                                Salida (-)
                            </label>
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Cantidad</label>
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={e => setQuantity(e.target.value)}
                            required
                            placeholder="0"
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid var(--border-color, #ddd)' }}
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Motivo <span style={{ fontWeight: 'normal', color: '#888' }}>(Opcional)</span></label>
                        <textarea
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder="Razón del ajuste..."
                            rows={3}
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid var(--border-color, #ddd)', resize: 'vertical' }}
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Referencia <span style={{ fontWeight: 'normal', color: '#888' }}>(Opcional)</span></label>
                        <input
                            type="text"
                            value={reference}
                            onChange={e => setReference(e.target.value)}
                            placeholder="Doc. referencia"
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid var(--border-color, #ddd)' }}
                        />
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '2rem', display: 'flex', gap: '1rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                borderRadius: '6px',
                                border: '1px solid var(--border-color, #ddd)',
                                background: 'transparent',
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                borderRadius: '6px',
                                border: 'none',
                                background: 'var(--primary-color, #007bff)',
                                color: 'white',
                                cursor: submitting ? 'not-allowed' : 'pointer',
                                fontWeight: 600,
                                opacity: submitting ? 0.7 : 1
                            }}
                        >
                            {submitting ? 'Guardando...' : 'Guardar Ajuste'}
                        </button>
                    </div>
                </form>
            </div>
            <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
          display: flex;
          justify-content: flex-end;
        }
      `}</style>
        </div>
    );
};
