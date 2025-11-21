import { useEffect, useRef } from 'react';
import type { ChartView, DashboardData } from '@/shared/types/dashboard';
import { formatCurrency, numberFormatter } from '@/shared/utils/format';
import { drawComparisonChart, drawDonutChart, drawMonthlyLineChart, drawWeeklyBarChart } from './charts';

type DashboardProps = {
  data: DashboardData;
  loading: boolean;
  error: string | null;
  chartView: ChartView;
  onChartViewChange: (view: ChartView) => void;
  updateLog: string[];
  onCheckUpdates?: () => void;
};

const DashboardView = ({ data, loading, error, chartView, onChartViewChange, updateLog, onCheckUpdates }: DashboardProps) => {
  const mainChartRef = useRef<HTMLCanvasElement | null>(null);
  const donutChartRef = useRef<HTMLCanvasElement | null>(null);
  const comparisonChartRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = mainChartRef.current;
    if (!canvas) return;
    if (chartView === 'week') {
      drawWeeklyBarChart(canvas, data.weeklySales);
    } else {
      drawMonthlyLineChart(canvas, data.monthlySales);
    }
  }, [data, chartView]);

  useEffect(() => {
    const canvas = donutChartRef.current;
    if (!canvas) return;
    const total = data.categoryBreakdown.reduce((sum, slice) => sum + slice.amount, 0);
    drawDonutChart(canvas, data.categoryBreakdown, total);
  }, [data]);

  useEffect(() => {
    const canvas = comparisonChartRef.current;
    if (!canvas) return;
    drawComparisonChart(canvas, data.comparison);
  }, [data]);

  return (
    <main className="dashboard app-view is-visible" id="dashboard-view" data-app-view>
      {loading ? <div className="loading-banner">Cargando datos desde el backend...</div> : null}
      {error ? <div className="loading-banner" id="dashboard-error">No se pudo cargar el dashboard: {error}</div> : null}

      <section className="kpi-grid">
        {data.kpis.map((kpi) => {
          const valueText = typeof kpi.amount === 'number' && kpi.format !== 'text' ? formatCurrency(kpi.amount) : String(kpi.amount);
          return (
            <article key={kpi.id} className="kpi-card fade-in" style={{ ['--accent' as string]: kpi.accent }}>
              <div className="kpi-icon">{kpi.icon}</div>
              <div className="kpi-title">{kpi.title}</div>
              <div className="kpi-value">{valueText}</div>
              <div className="kpi-subvalue">{kpi.subValue}</div>
            </article>
          );
        })}
      </section>

      <section className="charts-grid">
        <article className="card card-main-chart">
          <div className="card-header">
            <div>
              <h2 style={{ margin: 0, fontSize: 18 }}>Rendimiento de ventas</h2>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>Escoge un rango para analizar el comportamiento diario</p>
            </div>
            <div className="chart-controls">
              <div className="toggle-group" role="group">
                <button type="button" data-chart-view="week" className={chartView === 'week' ? 'active' : ''} onClick={() => onChartViewChange('week')}>
                  Semana
                </button>
                <button type="button" data-chart-view="month" className={chartView === 'month' ? 'active' : ''} onClick={() => onChartViewChange('month')}>
                  Mes
                </button>
              </div>
              <label>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Fecha</span>
                <input type="date" className="date-filter" defaultValue={new Date().toISOString().split('T')[0]} />
              </label>
            </div>
          </div>
          <div className="main-chart-graphic" id="main-chart">
            <canvas id="main-chart-canvas" ref={mainChartRef}></canvas>
          </div>
        </article>

        <div className="side-charts">
          <article className="card">
            <header className="card-header" style={{ marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>Ventas por categoria</h3>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Ultimos 30 dias</span>
            </header>
            <div className="donut-wrapper">
              <div className="donut-chart" id="category-donut">
                <canvas id="category-donut-canvas" className="donut-canvas" ref={donutChartRef}></canvas>
              </div>
              <div className="donut-legend" id="category-legend">
                {data.categoryBreakdown.map((slice) => {
                  const total = data.categoryBreakdown.reduce((sum, s) => sum + s.amount, 0);
                  const percent = Math.round((slice.amount / total) * 100);
                  return (
                    <div className="legend-item fade-in" key={slice.label}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="legend-pill" style={{ background: slice.color }}></span>
                        {slice.label}
                      </span>
                      <strong>{percent}%</strong>
                    </div>
                  );
                })}
              </div>
            </div>
          </article>

          <article className="card">
            <header className="card-header" style={{ marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>Top 5 productos</h3>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Hoy</span>
            </header>
            <div className="top-products-list" id="top-products">
              {data.topProducts.map((product) => {
                const maxAmount = Math.max(...data.topProducts.map((p) => p.amount));
                return (
                  <div className="product-row fade-in" key={product.name}>
                    <header>
                      <span>{product.name}</span>
                      <span>{formatCurrency(product.amount)}</span>
                    </header>
                    <div className="product-bar">
                      <span style={{ width: `${(product.amount / maxAmount) * 100}%` }}></span>
                    </div>
                    <small style={{ color: 'var(--text-muted)' }}>{product.units} unidades</small>
                  </div>
                );
              })}
            </div>
          </article>
        </div>
      </section>

      <section className="card comparison-card">
        <div className="card-header">
          <div>
            <h3 style={{ margin: 0, fontSize: 18 }}>Comparativa mensual</h3>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>Mes actual vs mes anterior</p>
          </div>
        </div>
        <div className="comparison-legend">
          <span>
            <span className="legend-dot current"></span> Mes actual
          </span>
          <span>
            <span className="legend-dot previous"></span> Mes anterior
          </span>
        </div>
        <div className="card-body" id="comparison-chart">
          <canvas id="comparison-chart-canvas" ref={comparisonChartRef}></canvas>
        </div>
      </section>

      <section className="tables-grid">
        <article className="card">
          <header className="card-header" style={{ marginBottom: 10 }}>
            <h3 style={{ margin: 0 }}>Ultimas 10 ventas</h3>
          </header>
          <div className="data-table-wrapper">
            <table className="table-sales" id="table-sales">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Documento</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {data.lastSales.map((sale) => (
                  <tr key={`${sale.document}-${sale.datetime}`}>
                    <td>{sale.datetime}</td>
                    <td>{sale.customer}</td>
                    <td>{sale.document}</td>
                    <td className="align-right">{formatCurrency(sale.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-actions" style={{ textAlign: 'right', marginTop: 12 }}>
            <button className="link-button" data-action="ventas" style={{ border: 'none', background: 'none', color: '#3498db', fontWeight: 600, cursor: 'pointer' }}>
              Ver todo
            </button>
          </div>
        </article>

        <article className="card">
          <header className="card-header" style={{ marginBottom: 10 }}>
            <h3 style={{ margin: 0 }}>Stock bajo</h3>
          </header>
          <div className="data-table-wrapper">
            <table className="table-stock" id="table-stock">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Stock</th>
                  <th>Min</th>
                </tr>
              </thead>
              <tbody>
                {data.lowStock.map((row) => (
                  <tr key={row.product}>
                    <td>{row.product}</td>
                    <td>{row.stock}</td>
                    <td>{row.min}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-actions" style={{ textAlign: 'right', marginTop: 12 }}>
            <button className="link-button" data-action="stock" style={{ border: 'none', background: 'none', color: '#3498db', fontWeight: 600, cursor: 'pointer' }}>
              Ver todo
            </button>
          </div>
        </article>

        <article className="card">
          <header className="card-header" style={{ marginBottom: 10 }}>
            <h3 style={{ margin: 0 }}>Ultimos movimientos</h3>
          </header>
          <div className="data-table-wrapper">
            <table className="table-movements" id="table-movements">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {data.movements.map((movement) => {
                  const typeLabel = movement.type === 'in' ? 'Entrada' : 'Salida';
                  const pillClass = movement.type === 'in' ? 'status-pill up' : 'status-pill down';
                  return (
                    <tr key={`${movement.product}-${movement.date}`}>
                      <td>{movement.product}</td>
                      <td>
                        <span className={pillClass}>{typeLabel}</span>
                      </td>
                      <td>{numberFormatter.format(movement.qty)}</td>
                      <td>{movement.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="table-actions" style={{ textAlign: 'right', marginTop: 12 }}>
            <button className="link-button" data-action="movimientos" style={{ border: 'none', background: 'none', color: '#3498db', fontWeight: 600, cursor: 'pointer' }}>
              Ver todo
            </button>
          </div>
        </article>
      </section>

      <section className="card">
        <header className="card-header" style={{ marginBottom: 12 }}>
          <div>
            <h3 style={{ margin: 0 }}>Estado de auto-actualizacion</h3>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>Registro de eventos recientes del updater</p>
          </div>
          <button className="btn-outline" onClick={onCheckUpdates}>
            Buscar actualizaciones
          </button>
        </header>
        <div id="update-log" style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: 12 }}>
          {updateLog.map((line, idx) => (
            <div key={`${line}-${idx}`}>{line}</div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default DashboardView;
