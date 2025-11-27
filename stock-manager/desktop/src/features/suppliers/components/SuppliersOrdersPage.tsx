import { useState, useEffect } from 'react';
import { formatCurrency } from '@/shared/utils/format';
import { usePurchaseOrders } from '../hooks/usePurchaseOrders';
import { useSuppliers } from '../hooks/useSuppliers';
import { CreatePurchaseOrderModal } from './CreatePurchaseOrderModal';
import { ReceivePurchaseOrderModal } from './ReceivePurchaseOrderModal';
import { PurchaseOrderDetailModal } from './PurchaseOrderDetailModal';
import { UploadInvoiceModal } from './UploadInvoiceModal';
import { PurchaseOrder } from '../types';

const SuppliersOrdersPage = () => {
  const { orders, loading, fetchOrders, createOrder, receiveOrder, uploadInvoice } = usePurchaseOrders();
  const { suppliers } = useSuppliers();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [supplierId, setSupplierId] = useState<string>('all');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    fetchOrders({
      search,
      status: status === 'all' ? undefined : status,
      supplierId: supplierId === 'all' ? undefined : supplierId
    });
  }, [fetchOrders, search, status, supplierId]);

  const handleCreateOrder = async (data: any) => {
    await createOrder(data);
    fetchOrders({}); // Refresh list
  };

  const handleReceiveOrder = async (id: string, data: any) => {
    await receiveOrder(id, data);
    fetchOrders({}); // Refresh list
  };

  const handleUploadInvoice = async (file: File) => {
    if (selectedOrder) {
      await uploadInvoice(selectedOrder.id, file);
      fetchOrders({}); // Refresh list
    }
  };

  const openReceiveModal = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setIsReceiveModalOpen(true);
  };

  const openDetailModal = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const openUploadModal = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setIsUploadModalOpen(true);
  };

  return (
    <main className="suppliers-view app-view is-visible" id="suppliers-orders-view" data-app-view>
      <section className="suppliers-toolbar">
        <div className="suppliers-actions ">
          <button className="supplier-btn new" onClick={() => setIsCreateModalOpen(true)}>
            ➕ Nueva Orden de Compra
          </button>
        </div>
        <div className="suppliers-search">
          <button className="search-box">
            <span>🔍</span>
            <input
              type="search"
              placeholder="Numero de orden..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </button>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">Estado</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="ENVIADA">Enviada</option>
            <option value="PARCIAL">Parcial</option>
            <option value="RECIBIDA">Recibida</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
          <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
            <option value="all">Proveedor</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      <article className="supplier-card mt-12 mb-12">
        <header className="card-header">
          <div>
            <h2 style={{ margin: 0 }}>Órdenes de compra</h2>
            <small style={{ color: 'var(--text-muted)' }}>Gestiona y revisa las órdenes emitidas</small>
          </div>
        </header>
        <div className="data-table-wrapper">
          <table className="supplier-table">
            <thead>
              <tr>
                <th>Orden</th>
                <th>Proveedor</th>
                <th>Fecha</th>
                <th className="align-right">Monto</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && orders.length === 0 && (
                <tr><td colSpan={6} className="text-center">Cargando...</td></tr>
              )}
              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="muted">
                    No hay órdenes con estos filtros.
                  </td>
                </tr>
              )}
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.orderNumber}</td>
                  <td>{order.supplierName}</td>
                  <td>{new Date(order.date).toLocaleDateString()}</td>
                  <td className="align-right">{formatCurrency(order.total)}</td>
                  <td>
                    <span className={`badge-status ${order.status.toLowerCase()}`}>{order.status}</span>
                  </td>
                  <td>
                    <div className="supplier-actions">
                      <button type="button" onClick={() => openDetailModal(order)} title="Ver Detalle">
                        🔍
                      </button>
                      {order.status !== 'RECIBIDA' && order.status !== 'CANCELADA' && (
                        <button type="button" onClick={() => openReceiveModal(order)} title="Recibir Mercadería">
                          📦
                        </button>
                      )}
                      <button type="button" onClick={() => openUploadModal(order)} title="Subir Factura">
                        �
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <CreatePurchaseOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateOrder}
      />

      {selectedOrder && (
        <>
          <ReceivePurchaseOrderModal
            isOpen={isReceiveModalOpen}
            onClose={() => setIsReceiveModalOpen(false)}
            order={selectedOrder}
            onSubmit={handleReceiveOrder}
          />

          <PurchaseOrderDetailModal
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
            order={selectedOrder}
          />

          <UploadInvoiceModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            onSubmit={handleUploadInvoice}
            title={`Subir Factura - ${selectedOrder.orderNumber}`}
          />
        </>
      )}
    </main>
  );
};

export default SuppliersOrdersPage;
