import { useMemo, useState } from 'react';
import { SALES_KPIS, SALES_LIST } from '@/shared/data/sales';

type SalesListProps = {
  variant: 'listado' | 'devoluciones';
};

const formatMoney = (value: number) =>
  value.toLocaleString('es-GT', { style: 'currency', currency: 'GTQ', minimumFractionDigits: 2, maximumFractionDigits: 2 });

const SalesList = ({ variant }: SalesListProps) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pagada' | 'pendiente' | 'anulada'>('all');

  const filtered = useMemo(() => {
    return SALES_LIST.filter((sale) => {
      const matchesText =
        !search || `${sale.docNumber} ${sale.client} ${sale.user}`.toLowerCase().includes(search.trim().toLowerCase());
      const matchesStatus = statusFilter === 'all' || sale.status === statusFilter;
      return matchesText && matchesStatus;
    });
  }, [search, statusFilter]);

  return (
    <section className="sales-list">
      <div className="panel-header">
        <div>
          <p className="eyebrow">{variant === 'devoluciones' ? 'Devoluciones y notas de credito' : 'Listado de ventas'}</p>
          <h3>Filtra, revisa y reimprime documentos</h3>
        </div>
        <div className="list-actions">
          <button type="button" className="ghost-btn">
            [Rpt] Reporte detallado
          </button>
          <button type="button" className="ghost-btn">
            [XLS] Exportar Excel
          </button>
          <button type="button" className="ghost-btn">
            [PDF] Exportar PDF
          </button>
        </div>
      </div>

      <div className="sales-filters card">
        <div className="filter-row">
          <label>
            <span>Fecha inicio</span>
            <input type="date" />
          </label>
          <label>
            <span>Fecha fin</span>
            <input type="date" />
          </label>
          <label>
            <span>Cliente</span>
            <input type="text" placeholder="Cliente" />
          </label>
          <label>
            <span>Tipo doc</span>
            <select>
              <option>Todos</option>
              <option>Factura</option>
              <option>Comprobante</option>
            </select>
          </label>
          <label>
            <span>Estado</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pagada' | 'pendiente' | 'anulada')}>
              <option value="all">Todos</option>
              <option value="pagada">Pagadas</option>
              <option value="pendiente">Pendientes</option>
              <option value="anulada">Anuladas</option>
            </select>
          </label>
          <div className="filter-actions">
            <input type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <button type="button">Buscar</button>
            <button type="button" className="ghost-btn">
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <div className="kpi-grid compact">
        {SALES_KPIS.map((kpi) => (
          <div key={kpi.id} className="kpi-card">
            <div className="kpi-title">{kpi.title}</div>
            <div className="kpi-value">{kpi.value}</div>
            <div className="kpi-subvalue">{kpi.subValue}</div>
          </div>
        ))}
      </div>

      <div className="sales-table card">
        <div className="table-head">
          <span>Fecha</span>
          <span>No. Doc</span>
          <span>Tipo</span>
          <span>Cliente</span>
          <span>Total</span>
          <span>Usuario</span>
          <span>Estado</span>
          <span>Acciones</span>
        </div>
        {filtered.map((sale) => (
          <div key={sale.id} className={`table-row status-${sale.status}`}>
            <span>{sale.date}</span>
            <span>{sale.docNumber}</span>
            <span>{sale.type}</span>
            <span>{sale.client}</span>
            <span>{formatMoney(sale.total)}</span>
            <span>{sale.user}</span>
            <div className="status-chip">
              {sale.status === 'pagada' ? 'Pagada' : sale.status === 'pendiente' ? 'Pendiente' : 'Anulada'}
            </div>
            <div className="row-actions">
              <button type="button" className="ghost-btn">
                Ver
              </button>
              <button type="button" className="ghost-btn">
                Acciones
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="sales-mobile-cards">
        {filtered.map((sale) => (
          <div key={sale.id} className={`sale-card status-${sale.status}`}>
            <div className="card-top">
              <div>
                <strong>{sale.docNumber}</strong>
                <p>{sale.client}</p>
              </div>
              <div className="status-chip">
                {sale.status === 'pagada' ? 'Pagada' : sale.status === 'pendiente' ? 'Pendiente' : 'Anulada'}
              </div>
            </div>
            <div className="card-middle">
              <span>{sale.date}</span>
              <span>{sale.user}</span>
            </div>
            <div className="card-bottom">
              <div className="total">{formatMoney(sale.total)}</div>
              <div className="card-actions">
                <button type="button" className="ghost-btn">
                  Ver
                </button>
                <button type="button" className="ghost-btn">
                  Acciones
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="table-foot">
        <div className="pagination">[&lt;] 1 2 3 ... 15 [&gt;]</div>
        <div className="muted">Mostrando {filtered.length} resultados</div>
      </div>
    </section>
  );
};

export default SalesList;
