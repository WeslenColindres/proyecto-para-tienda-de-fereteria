import { useMemo, useState } from 'react';
import { SUPPLIER_KPIS, SUPPLIER_PURCHASES, SUPPLIER_REPORT, SUPPLIERS } from '@/shared/data/suppliers';
import { formatCurrency } from '@/shared/utils/format';

type AgingFilter = 'all' | '0-30' | '31-60' | '61+';

const SuppliersPayablesPage = () => {
  const [supplierId, setSupplierId] = useState<string | 'all'>('all');
  const [aging, setAging] = useState<AgingFilter>('all');

  const rows = useMemo(() => {
    return SUPPLIER_PURCHASES.filter((doc) => {
      if (supplierId !== 'all' && doc.supplierId !== supplierId) return false;
      if (aging !== 'all') {
        const overdue = doc.status === 'vencido' ? 45 : doc.status === 'pendiente' ? 10 : 0;
        if (aging === '0-30' && !(overdue <= 30)) return false;
        if (aging === '31-60' && !(overdue > 30 && overdue <= 60)) return false;
        if (aging === '61+' && overdue <= 60) return false;
      }
      return true;
    });
  }, [aging, supplierId]);

  return (
    <main className="suppliers-view app-view is-visible" id="suppliers-cxp-view" data-app-view>
      <header className="suppliers-toolbar">
        <div className="suppliers-actions">
          <h2 style={{ margin: 0 }}>Cuentas por pagar</h2>
        </div>
        <div className="suppliers-search">
          <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
            <option value="all">Proveedor</option>
            {SUPPLIERS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select value={aging} onChange={(e) => setAging(e.target.value as AgingFilter)}>
            <option value="all">Todos</option>
            <option value="0-30">0-30 dias</option>
            <option value="31-60">31-60 dias</option>
            <option value="61+">61+ dias</option>
          </select>
          <button className="supplier-btn" onClick={() => alert('Registrar pago')}>
            Registrar pago
          </button>
        </div>
      </header>

      <section className="report-card">
        <div className="report-grid">
          {SUPPLIER_KPIS.map((kpi) => (
            <div className="mini-kpi" key={kpi.label}>
              <small style={{ color: 'var(--text-muted)' }}>{kpi.label}</small>
              <strong>{kpi.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="report-card">
        <header className="card-header">
          <h3 style={{ margin: 0 }}>Compras por proveedor</h3>
          <button className="supplier-btn export" onClick={() => alert('Exportar a Excel/PDF')}>
            📤 Exportar
          </button>
        </header>
        <table className="report-table">
          <thead>
            <tr>
              <th>Proveedor</th>
              <th>Compras</th>
              <th>% Total</th>
              <th>Ultima</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {SUPPLIER_REPORT.map((row) => (
              <tr key={row.supplier}>
                <td>{row.supplier}</td>
                <td>{formatCurrency(row.purchases)}</td>
                <td>{row.share}%</td>
                <td>{row.lastPurchase}</td>
                <td>{row.state}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="supplier-card">
        <header className="card-header">
          <h3 style={{ margin: 0 }}>Documentos por pagar</h3>
          <small className="muted">Vencidos y pendientes</small>
        </header>
        <div className="data-table-wrapper">
          <table className="supplier-table">
            <thead>
              <tr>
                <th>Documento</th>
                <th>Proveedor</th>
                <th>Fecha</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="muted">
                    No hay documentos con esos filtros.
                  </td>
                </tr>
              )}
              {rows.map((row) => {
                const supplier = SUPPLIERS.find((s) => s.id === row.supplierId);
                return (
                  <tr key={row.id}>
                    <td>{row.documentNumber}</td>
                    <td>{supplier?.name ?? row.supplierId}</td>
                    <td>{row.date}</td>
                    <td>{formatCurrency(row.amount)}</td>
                    <td>
                      <span className={`badge-status ${row.status}`}>{row.status}</span>
                    </td>
                    <td>
                      <div className="supplier-actions">
                        <button onClick={() => alert('Ver ficha proveedor')}>👁️</button>
                        <button onClick={() => alert('Registrar pago')}>💸</button>
                        <button onClick={() => alert('Historial pagos')}>📚</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};

export default SuppliersPayablesPage;
