import { useEffect, useState } from 'react';
import { inventoryApi } from '@/shared/api/inventory';
import { ApiError } from '@/shared/api/types';
import {
  INVENTORY_DETAIL,
  INVENTORY_OVERVIEW,
  INVENTORY_WAREHOUSES,
  PRODUCT_MOVEMENTS,
} from '@/shared/data/products';
import type { InventoryReport } from '@/shared/types/products';
import { formatCurrency } from '@/shared/utils/format';
import { StockAdjustmentModal } from '../components/StockAdjustmentModal';

const buildFallback = (): InventoryReport => ({
  overview: INVENTORY_OVERVIEW,
  detail: INVENTORY_DETAIL,
  warehouses: INVENTORY_WAREHOUSES,
  alerts: [],
});

const ProductsStockPage = () => {
  const [report, setReport] = useState<InventoryReport>(buildFallback());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ id: number; name: string } | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await inventoryApi.overview();
      setReport(data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo cargar inventario';
      setError(message);
      setReport(buildFallback());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const handleOpenAdjustment = (product?: { id: number; name: string }) => {
    if (product) {
      setSelectedProduct(product);
    } else {
      // If no product selected (global button), maybe show a product selector inside modal?
      // For now, let's assume this button is primarily for a specific product context or we need to implement product search in modal.
      // To keep it simple as per request, let's just open it. But the modal needs a product.
      // Let's disable the global button for now or make it require selecting a product from the table first.
      // Better yet, let's add the button to the table rows.
      setSelectedProduct(null);
    }
    setIsModalOpen(true);
  };

  return (
    <section className="products-view app-view is-visible" data-app-view="productos-stock">
      <header className="products-toolbar">
        <div className="toolbar-actions">
          <button className="tool-btn export" onClick={() => window.print()}>Exportar</button>
          {/* <button className="tool-btn" onClick={() => setIsModalOpen(true)}>Ajustar Stock</button> */}
        </div>
        <div className="toolbar-filters">
          <span className="muted">{loading ? 'Cargando...' : 'Vista analitica de stock'}</span>
          {error && <span className="muted">Error: {error}</span>}
        </div>
      </header>

      <div className="products-grid">
        <section className="products-column">
          <article className="alerts-card">
            <header className="card-header" style={{ marginBottom: 10 }}>
              <h3 style={{ margin: 0 }}>Alertas de stock</h3>
              <span className="muted">Filtra, marca como atendida y consulta historial</span>
            </header>
            <div className="alerts-grid">
              {report.alerts?.length === 0 && <p className="muted">Sin alertas pendientes.</p>}
              {report.alerts?.map((alert) => (
                <div key={alert.id} className={`alert-box ${alert.level === 'critical' ? 'critical' : alert.level === 'warning' ? 'low' : 'preventive'}`}>
                  <strong>{alert.message}</strong>
                  <p className="muted">{alert.productId ?? 'Sistema'}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="existence-card">
            <header className="card-header" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Reporte de existencias</h3>
              <span className="muted" style={{ fontSize: '0.9rem' }}>Actualizado: {new Date().toLocaleTimeString()}</span>
            </header>
            <div className="kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div className="kpi-chip" style={{ background: 'var(--bg-hover, #f8f9fa)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                <small className="muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Valor inventario</small>
                <div id="inventory-kpi-value" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color, #007bff)' }}>
                  {formatCurrency(report.overview.inventoryValue)}
                </div>
              </div>
              <div className="kpi-chip" style={{ background: 'var(--bg-hover, #f8f9fa)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                <small className="muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Productos con stock</small>
                <div id="inventory-kpi-stock" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success-color, #28a745)' }}>
                  {report.overview.productsWithStock}
                </div>
              </div>
              <div className="kpi-chip" style={{ background: 'var(--bg-hover, #f8f9fa)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                <small className="muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Stock bajo</small>
                <div id="inventory-kpi-low" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--warning-color, #ffc107)' }}>
                  {report.overview.lowStock}
                </div>
              </div>
              <div className="kpi-chip" style={{ background: 'var(--bg-hover, #f8f9fa)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                <small className="muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Rotacion promedio</small>
                <div id="inventory-kpi-rotation" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--info-color, #17a2b8)' }}>
                  {report.overview.rotation}
                </div>
              </div>
            </div>

            <h4 style={{ margin: '0 0 1rem', borderBottom: '1px solid var(--border-color, #eee)', paddingBottom: '0.5rem' }}>Detalle por producto</h4>
            <div style={{ overflowX: 'auto' }}>
              <table className="simple-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-hover, #f8f9fa)', textAlign: 'left' }}>
                    <th style={{ padding: '0.8rem' }}>Producto</th>
                    <th style={{ padding: '0.8rem' }}>Stock</th>
                    <th style={{ padding: '0.8rem' }}>Valor</th>
                    <th style={{ padding: '0.8rem' }}>Ultimo mov.</th>
                    <th style={{ padding: '0.8rem' }}>Rotacion</th>
                    <th style={{ padding: '0.8rem' }}>Almacen</th>
                    <th style={{ padding: '0.8rem' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {report.detail.map((item, index) => (
                    <tr key={`${item.product}-${index}`} style={{ borderBottom: '1px solid var(--border-color, #eee)' }}>
                      <td style={{ padding: '0.8rem' }}>{item.product}</td>
                      <td style={{ padding: '0.8rem', fontWeight: 'bold' }}>{item.stock}</td>
                      <td style={{ padding: '0.8rem' }}>{formatCurrency(item.value)}</td>
                      <td style={{ padding: '0.8rem' }}>{item.last}</td>
                      <td style={{ padding: '0.8rem' }}>{item.rotation}</td>
                      <td style={{ padding: '0.8rem' }}>{item.warehouse}</td>
                      <td style={{ padding: '0.8rem' }}>
                        <button
                          className="icon-btn"
                          title="Ajustar Stock"
                          onClick={() => handleOpenAdjustment({ id: 0, name: item.product })}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                        >
                          ✏️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h4 style={{ margin: '2rem 0 1rem', borderBottom: '1px solid var(--border-color, #eee)', paddingBottom: '0.5rem' }}>Stock por almacen</h4>
            <div style={{ overflowX: 'auto' }}>
              <table className="simple-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-hover, #f8f9fa)', textAlign: 'left' }}>
                    <th style={{ padding: '0.8rem' }}>Almacen</th>
                    <th style={{ padding: '0.8rem' }}>Productos</th>
                    <th style={{ padding: '0.8rem' }}>Valor</th>
                    <th style={{ padding: '0.8rem' }}>% Total</th>
                    <th style={{ padding: '0.8rem' }}>Capacidad</th>
                  </tr>
                </thead>
                <tbody>
                  {report.warehouses.map((warehouse) => (
                    <tr key={warehouse.warehouse} style={{ borderBottom: '1px solid var(--border-color, #eee)' }}>
                      <td style={{ padding: '0.8rem' }}>{warehouse.warehouse}</td>
                      <td style={{ padding: '0.8rem' }}>{warehouse.products}</td>
                      <td style={{ padding: '0.8rem' }}>{formatCurrency(warehouse.value)}</td>
                      <td style={{ padding: '0.8rem' }}>{warehouse.percentage}%</td>
                      <td style={{ padding: '0.8rem' }}>
                        <div style={{ width: '100px', height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${warehouse.capacity}%`, height: '100%', background: 'var(--success-color, #28a745)' }}></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>

        <aside className="products-column editor-panel">
          <article className="movement-card">
            <header className="card-header" style={{ marginBottom: 8 }}>
              <h3 style={{ margin: 0 }}>Movimientos recientes</h3>
            </header>
            <div id="movement-list">
              {PRODUCT_MOVEMENTS.map((movement) => (
                <div className="movement-row" key={movement.id}>
                  <div>
                    <strong>{movement.product}</strong>
                    <div className="muted">
                      {movement.datetime} • {movement.document}
                    </div>
                  </div>
                  <div className={`movement-pill ${movement.qty >= 0 ? 'up' : 'down'}`}>
                    {movement.type} {movement.qty >= 0 ? '+' : ''}
                    {movement.qty}
                  </div>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </div>

      <StockAdjustmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          load(); // Reload data
        }}
        product={selectedProduct}
      />
    </section>
  );
};

export default ProductsStockPage;
