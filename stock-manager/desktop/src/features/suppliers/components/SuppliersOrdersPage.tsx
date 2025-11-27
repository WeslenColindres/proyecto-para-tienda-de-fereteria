import { useMemo, useState } from 'react';
import { formatCurrency } from '@/shared/utils/format';
import { SUPPLIERS } from '@/shared/data/suppliers';

type OrderStatus = 'pendiente' | 'enviada' | 'recibida' | 'cancelada';

type PurchaseOrder = {
  id: string;
  number: string;
  supplierId: string;
  supplierName: string;
  date: string;
  amount: number;
  status: OrderStatus;
};

const MOCK_ORDERS: PurchaseOrder[] = [
  { id: 'po-001', number: 'OC-2024-001', supplierId: 'sup-001', supplierName: 'Proveedor ABC', date: '2024-11-20', amount: 5200, status: 'pendiente' },
  { id: 'po-002', number: 'OC-2024-002', supplierId: 'sup-002', supplierName: 'Distribuidora XYZ', date: '2024-11-19', amount: 8400, status: 'enviada' },
  { id: 'po-003', number: 'OC-2024-003', supplierId: 'sup-003', supplierName: 'Logistica del Norte', date: '2024-11-18', amount: 4100, status: 'recibida' },
  { id: 'po-004', number: 'OC-2024-004', supplierId: 'sup-005', supplierName: 'Tecnica Industrial', date: '2024-11-15', amount: 9300, status: 'cancelada' },
];

const SuppliersOrdersPage = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<OrderStatus | 'all'>('all');
  const [supplierId, setSupplierId] = useState<string | 'all'>('all');

  const filtered = useMemo(() => {
    return MOCK_ORDERS.filter((order) => {
      if (status !== 'all' && order.status !== status) return false;
      if (supplierId !== 'all' && order.supplierId !== supplierId) return false;
      if (search.trim()) {
        const term = search.toLowerCase();
        const haystack = `${order.number} ${order.supplierName}`;
        if (!haystack.toLowerCase().includes(term)) return false;
      }
      return true;
    });
  }, [search, status, supplierId]);

  return (
    <main className="suppliers-view app-view is-visible" id="suppliers-orders-view" data-app-view>
      <section className="suppliers-toolbar">
        <div className="suppliers-actions ">
          <button className="supplier-btn new" onClick={() => alert('Nueva orden de compra')}>
            ➕ Nueva Orden de Compra
          </button>
        </div>
        <div className="suppliers-search">
          <button className="search-box">
            <span>🔍</span>
            <input type="search" placeholder="Numero de orden o referencia..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </button>
          <select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus | 'all')}>
            <option value="all">Estado</option>
            <option value="pendiente">Pendiente</option>
            <option value="enviada">Enviada</option>
            <option value="recibida">Recibida</option>
            <option value="cancelada">Cancelada</option>
          </select>
          <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
            <option value="all">Proveedor</option>
            {SUPPLIERS.map((s) => (
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
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="muted">
                    No hay órdenes con estos filtros.
                  </td>
                </tr>
              )}
              {filtered.map((order) => (
                <tr key={order.id}>
                  <td>{order.number}</td>
                  <td>{order.supplierName}</td>
                  <td>{order.date}</td>
                  <td className="align-right">{formatCurrency(order.amount)}</td>
                  <td>
                    <span className={`badge-status ${order.status}`}>{order.status}</span>
                  </td>
                  <td>
                    <div className="supplier-actions">
                      <button type="button" onClick={() => alert(`Detalle ${order.number}`)}>
                        🔍
                      </button>
                      <button type="button" onClick={() => alert(`Recibir ${order.number}`)}>
                        📦
                      </button>
                      <button type="button" onClick={() => alert(`Cancelar ${order.number}`)}>
                        🛑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </main>
  );
};

export default SuppliersOrdersPage;
