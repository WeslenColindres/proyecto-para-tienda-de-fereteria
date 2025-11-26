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

  useEffect(() => {
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
    load().catch(() => undefined);
  }, []);

  return (
    <section className="products-view app-view is-visible" data-app-view="productos-stock">
      <header className="products-toolbar">
        <div className="toolbar-actions">
          <button className="tool-btn export" onClick={() => window.print()}>Exportar</button>
          <button className="tool-btn import" onClick={() => alert('Importar inventario no implementado')}>Importar</button>
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
            <header className="card-header" style={{ marginBottom: 8 }}>
              <h3 style={{ margin: 0 }}>Reporte de existencias</h3>
            </header>
            <div className="kpi-row">
              <div className="kpi-chip">
                <small className="muted">Valor inventario</small>
                <div id="inventory-kpi-value">{formatCurrency(report.overview.inventoryValue)}</div>
              </div>
              <div className="kpi-chip">
                <small className="muted">Productos con stock</small>
                <div id="inventory-kpi-stock">{report.overview.productsWithStock}</div>
              </div>
              <div className="kpi-chip">
                <small className="muted">Stock bajo</small>
                <div id="inventory-kpi-low">{report.overview.lowStock}</div>
              </div>
              <div className="kpi-chip">
                <small className="muted">Rotacion promedio</small>
                <div id="inventory-kpi-rotation">{report.overview.rotation}</div>
              </div>
            </div>
            <h4 style={{ margin: '6px 0 4px' }}>Detalle por producto</h4>
            <table className="simple-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Stock</th>
                  <th>Valor</th>
                  <th>Ultimo mov.</th>
                  <th>Rotacion</th>
                  <th>Almacen</th>
                </tr>
              </thead>
              <tbody>
                {report.detail.map((item) => (
                  <tr key={`${item.product}-${item.warehouse}`}>
                    <td>{item.product}</td>
                    <td>{item.stock}</td>
                    <td>{formatCurrency(item.value)}</td>
                    <td>{item.last}</td>
                    <td>{item.rotation}</td>
                    <td>{item.warehouse}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h4 style={{ margin: '10px 0 4px' }}>Stock por almacen</h4>
            <table className="simple-table">
              <thead>
                <tr>
                  <th>Almacen</th>
                  <th>Productos</th>
                  <th>Valor</th>
                  <th>% Total</th>
                  <th>Capacidad</th>
                </tr>
              </thead>
              <tbody>
                {report.warehouses.map((warehouse) => (
                  <tr key={warehouse.warehouse}>
                    <td>{warehouse.warehouse}</td>
                    <td>{warehouse.products}</td>
                    <td>{formatCurrency(warehouse.value)}</td>
                    <td>{warehouse.percentage}%</td>
                    <td>{warehouse.capacity}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    </section>
  );
};

export default ProductsStockPage;
