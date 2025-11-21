import { useEffect, useMemo, useState } from 'react';
import { ACTIVE_ITEM_TO_REPORT, FAVORITE_REPORTS, REPORT_MENU, REPORT_VIEWS, SCHEDULED_REPORTS, SEND_HISTORY } from '@/shared/data/reports';
import type { ReportId } from '@/shared/types/reports';
import { DESKTOP_BREAKPOINT, TABLET_BREAKPOINT } from '@/shared/constants/layout';

type ReportsViewProps = {
  activeItem: string;
};

type DateRange = {
  start: string;
  end: string;
};

const STORAGE_KEY = 'reports-last-selected';
const STORAGE_CONFIG = 'reports-last-config';

const ReportsView = ({ activeItem }: ReportsViewProps) => {
  const [viewport, setViewport] = useState({ isMobile: false, isTablet: false });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({ start: '2024-01-01', end: '2024-11-22' });
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState('Listo');
  const [showFilters, setShowFilters] = useState(false);

  const persisted = ((): ReportId | null => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (stored as ReportId) : null;
  })();
  const initialReport = ACTIVE_ITEM_TO_REPORT[activeItem] ?? persisted ?? 'ventas-fecha';
  const [selectedReport, setSelectedReport] = useState<ReportId>(initialReport);

  const view = REPORT_VIEWS[selectedReport];

  useEffect(() => {
    const mapped = ACTIVE_ITEM_TO_REPORT[activeItem];
    if (mapped) setSelectedReport(mapped);
  }, [activeItem]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, selectedReport);
  }, [selectedReport]);

  useEffect(() => {
    const handle = () => {
      const width = window.innerWidth;
      const isMobile = width < TABLET_BREAKPOINT;
      const isTablet = width >= TABLET_BREAKPOINT && width < DESKTOP_BREAKPOINT;
      setViewport({ isMobile, isTablet });
      if (!isMobile) setDrawerOpen(false);
    };
    handle();
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  const handleSelectReport = (reportId: ReportId) => {
    setSelectedReport(reportId);
    setStatus(`Reporte ${reportId} seleccionado`);
    if (viewport.isMobile) setDrawerOpen(false);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setStatus('Actualizando datos...');
    setTimeout(() => {
      setRefreshing(false);
      setStatus(`Datos actualizados ${new Date().toLocaleTimeString()}`);
    }, 900);
  };

  const handleSaveConfig = () => {
    const payload = { selectedReport, dateRange };
    localStorage.setItem(STORAGE_CONFIG, JSON.stringify(payload));
    setStatus('Configuracion guardada como favorito');
  };

  const densities = ['Compacta', 'Normal', 'Comoda'] as const;
  const tableColumns = view.table.columns;
  const tableRows = view.table.rows;

  const toolbarTitle = useMemo(() => {
    const mainCategory = REPORT_MENU.find((cat) => cat.items.some((it) => it.id === selectedReport));
    return mainCategory ? `${mainCategory.label} / ${view.title}` : view.title;
  }, [selectedReport, view.title]);

  return (
    <main className="reports-view app-view is-visible" id="reports-view" data-app-view>
      <section className="reports-toolbar">
        <div className="toolbar-left">
          <div className="toolbar-eyebrow">Modulo de Informes y Reportes</div>
          <div className="toolbar-title">{toolbarTitle}</div>
          <div className="toolbar-dates">
            <label>
              <span>Desde</span>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
              />
            </label>
            <label>
              <span>Hasta</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
              />
            </label>
            <button className={`btn ghost ${refreshing ? 'is-loading' : ''}`} onClick={handleRefresh}>
              {refreshing ? 'Actualizando...' : 'Actualizar'}
            </button>
            <button className="btn primary" onClick={handleSaveConfig}>
              Guardar configuracion
            </button>
          </div>
        </div>
        <div className="toolbar-right">
          <button className="btn secondary" onClick={() => setShowFilters((prev) => !prev)}>
            {showFilters ? 'Ocultar filtros' : 'Filtros avanzados'}
          </button>
          <button className="btn secondary" onClick={() => setDrawerOpen(true)}>
            Menu reportes
          </button>
        </div>
      </section>

      <section className={`reports-grid ${drawerOpen ? 'drawer-open' : ''}`}>
        <aside className={`reports-menu ${viewport.isMobile ? 'is-mobile' : ''}`}>
          <header>
            <div className="menu-title">Menu de reportes</div>
            {viewport.isMobile ? (
              <button className="icon-button" onClick={() => setDrawerOpen(false)} aria-label="Cerrar menu">
                ✕
              </button>
            ) : null}
          </header>
          {REPORT_MENU.map((category) => (
            <div className="menu-category" key={category.id}>
              <div className="menu-category-title">
                <span className="meta-label">{category.icon}</span>
                <span>{category.label}</span>
                {category.badge ? <span className="badge info">{category.badge}</span> : null}
              </div>
              <div className="menu-items">
                {category.items.map((item) => {
                  const isActive = item.id === selectedReport;
                  return (
                    <button
                      key={item.id}
                      className={`menu-item ${isActive ? 'active' : ''}`}
                      onClick={() => handleSelectReport(item.id)}
                    >
                      <span className="meta-label">{item.icon}</span>
                      <span className="menu-label">{item.label}</span>
                      {item.badge ? <span className="badge warn">{item.badge}</span> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </aside>

        <section className="report-canvas">
          <div className="report-header">
            <div>
              <div className="report-tag">{view.tag ?? 'Informe'}</div>
              <h2>{view.title}</h2>
              <p className="muted">{view.subtitle}</p>
            </div>
            <div className="density-chips">
              {densities.map((d) => (
                <span key={d} className="chip">
                  {d}
                </span>
              ))}
            </div>
          </div>

          <div className={`kpi-tiles ${refreshing ? 'is-loading' : ''}`}>
            {view.kpis.map((kpi) => (
              <article key={kpi.id} className={`kpi-tile tone-${kpi.tone ?? 'neutral'}`}>
                <div className="kpi-meta">
                  <span className="meta-label">{kpi.icon ?? '•'}</span>
                  <span className="meta-helper">{kpi.helper}</span>
                </div>
                <div className="kpi-label">{kpi.label}</div>
                <div className="kpi-value">{kpi.value}</div>
                {kpi.trend ? <div className="kpi-trend">{kpi.trend}</div> : null}
              </article>
            ))}
          </div>

          <div className="chart-and-filters">
            <article className="report-card chart-card">
              <div className="card-header">
                <div>
                  <div className="card-eyebrow">{view.chart.title}</div>
                  <h3>{view.chart.description}</h3>
                  <p className="muted">{view.chart.hint}</p>
                </div>
                <button className="btn ghost small">Fullscreen</button>
              </div>
              <div className="chart-placeholder">{view.chart.type.toUpperCase()} (placeholder)</div>
            </article>

            <article className={`report-card filters-card ${showFilters ? 'visible' : ''}`}>
              <div className="card-header">
                <div>
                  <div className="card-eyebrow">Filtros avanzados</div>
                  <h3>Refina el resultado</h3>
                </div>
                <button className="btn ghost small" onClick={() => setShowFilters(false)}>
                  Cerrar
                </button>
              </div>
              <div className="filter-grid">
                {view.filters.map((filter) => (
                  <label key={filter} className="filter-chip">
                    <span>{filter}</span>
                    <input type="text" placeholder={`Filtrar ${filter.toLowerCase()}`} />
                  </label>
                ))}
              </div>
              <div className="filter-actions">
                <button className="btn primary small">Aplicar filtros</button>
                <button className="btn ghost small">Limpiar</button>
                <button className="btn secondary small">Guardar como favorito</button>
              </div>
            </article>
          </div>

          <article className="report-card table-card">
            <div className="card-header">
              <div>
                <div className="card-eyebrow">Detalle</div>
                <h3>Tabla de datos</h3>
                <p className="muted">Cabecera fija, columnas sticky y scroll horizontal en movil</p>
              </div>
              <div className="table-actions">
                <select>
                  <option>Compacta</option>
                  <option>Normal</option>
                  <option>Comoda</option>
                </select>
                <button className="btn ghost small">Ordenar</button>
              </div>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    {tableColumns.map((col) => (
                      <th key={col.id} style={{ width: col.width ?? 'auto', textAlign: col.align ?? 'left' }}>
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row, idx) => (
                    <tr key={`${view.id}-${idx}`}>
                      {tableColumns.map((col) => (
                        <td key={`${col.id}-${idx}`} className={col.align === 'right' ? 'align-right' : ''}>
                          {row[col.id] as string}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <footer className="table-footer">
              <div>{view.table.totals ? `Totales: ${view.table.totals.total ?? ''}` : 'Totales no disponibles'}</div>
              <div className="table-actions">
                {view.actions.map((action) => (
                  <button key={action} className="btn ghost small">
                    {action}
                  </button>
                ))}
              </div>
            </footer>
          </article>

          <div className="report-card actions-card">
            <div className="card-header">
              <div>
                <div className="card-eyebrow">Exportar y enviar</div>
                <h3>Acciones rapidas</h3>
                <p className="muted">Atajos: Ctrl+E (Exportar), Ctrl+M (Email), Ctrl+P (Imprimir)</p>
              </div>
            </div>
            <div className="actions-grid">
              <button className="btn primary">Descargar Excel</button>
              <button className="btn secondary">Descargar PDF</button>
              <button className="btn ghost">Enviar Email</button>
              <button className="btn ghost">Enviar WhatsApp</button>
            </div>
          </div>

          <div className="report-secondary-grid">
            <article className="report-card favorites-card">
              <div className="card-header">
                <div>
                  <div className="card-eyebrow">Reportes favoritos</div>
                  <h3>Acceso rapido</h3>
                </div>
              </div>
              <div className="favorites-grid">
                {FAVORITE_REPORTS.map((fav) => (
                  <button
                    key={fav.id}
                    className="favorite-card"
                    onClick={() => handleSelectReport(fav.id)}
                    title="Abrir reporte favorito"
                  >
                    <div className="favorite-title">{fav.label}</div>
                    <div className="favorite-kpi">{fav.kpi}</div>
                    <span className="meta-label">{fav.action}</span>
                  </button>
                ))}
              </div>
            </article>

            <article className="report-card scheduled-card">
              <div className="card-header">
                <div>
                  <div className="card-eyebrow">Envios programados</div>
                  <h3>Bandeja y programacion</h3>
                </div>
                <button className="btn ghost small">Nuevo programado</button>
              </div>
              <div className="schedule-list">
                {SCHEDULED_REPORTS.map((task) => (
                  <div key={task.id} className={`schedule-row ${task.active ? 'active' : 'inactive'}`}>
                    <div className="schedule-title">{task.label}</div>
                    <div className="schedule-meta">
                      {task.frequency.toUpperCase()} | {task.time} | {task.format.join(' + ')}
                    </div>
                    <div className="schedule-recipients">{task.recipients.join(', ')}</div>
                  </div>
                ))}
              </div>
              <div className="history-list">
                {SEND_HISTORY.map((row) => (
                  <div key={row.id} className={`history-row ${row.status === 'ok' ? 'ok' : 'error'}`}>
                    <span>{row.datetime}</span>
                    <span>{row.report}</span>
                    <span>{row.target}</span>
                    <span className="meta-label">{row.channel}</span>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>
      </section>

      <div className="reports-status">{status}</div>
      {drawerOpen && viewport.isMobile ? <div className="reports-backdrop" onClick={() => setDrawerOpen(false)} /> : null}
    </main>
  );
};

export default ReportsView;
