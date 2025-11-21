import { useEffect, useMemo, useState } from 'react';
import { DESKTOP_BREAKPOINT, TABLET_BREAKPOINT } from '@/shared/constants/layout';
import { SUPPLIER_KPIS, SUPPLIER_PURCHASES, SUPPLIER_REPORT, SUPPLIERS } from '@/shared/data/suppliers';
import type { SupplierItem, SupplierStatus } from '@/shared/types/suppliers';
import { formatCurrency } from '@/shared/utils/format';

type SupplierTab = 'proveedores' | 'detalle' | 'compras';
type ViewportMode = 'desktop' | 'tablet' | 'mobile';

type SupplierFormState = {
  nit: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  city: string;
  category: string;
  address: string;
  creditDays: number;
  creditLimit: number;
  status: SupplierStatus;
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SuppliersView = () => {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SupplierStatus>('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<SupplierTab>('proveedores');
  const [mode, setMode] = useState<ViewportMode>('desktop');
  const [selectedId, setSelectedId] = useState(SUPPLIERS[0]?.id ?? '');
  const [isEditing, setIsEditing] = useState(false);
  const selected = useMemo(() => SUPPLIERS.find((s) => s.id === selectedId) ?? SUPPLIERS[0], [selectedId]);
  const [form, setForm] = useState<SupplierFormState>(() => {
    const supplier = selected ?? SUPPLIERS[0];
    return {
      nit: supplier?.nit ?? '',
      name: supplier?.name ?? '',
      contact: supplier?.contact ?? '',
      phone: supplier?.phone ?? '',
      email: supplier?.email ?? '',
      city: supplier?.city ?? '',
      category: supplier?.category ?? '',
      address: 'Calle Principal 123, Zona 12',
      creditDays: supplier?.creditDays ?? 0,
      creditLimit: supplier?.creditLimit ?? 0,
      status: supplier?.status ?? 'activo'
    };
  });

  const resetForm = () => {
    if (!selected) return;
    setForm({
      nit: selected.nit,
      name: selected.name,
      contact: selected.contact,
      phone: selected.phone,
      email: selected.email,
      city: selected.city,
      category: selected.category,
      address: 'Calle Principal 123, Zona 12',
      creditDays: selected.creditDays,
      creditLimit: selected.creditLimit,
      status: selected.status
    });
    setIsEditing(false);
  };

  useEffect(() => {
    const onResize = () => {
      const width = window.innerWidth;
      const nextMode: ViewportMode = width >= DESKTOP_BREAKPOINT ? 'desktop' : width >= TABLET_BREAKPOINT ? 'tablet' : 'mobile';
      setMode(nextMode);
      if (nextMode === 'desktop') setActiveTab('proveedores');
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    resetForm();
  }, [selected]);

  const highlightText = (text: string) => {
    const term = search.trim();
    if (!term) return text;
    const regex = new RegExp(`(${escapeRegExp(term)})`, 'ig');
    return text.split(regex).map((chunk, idx) =>
      chunk.toLowerCase() === term.toLowerCase() ? (
        <mark key={`${chunk}-${idx}`} className="highlight-term">
          {chunk}
        </mark>
      ) : (
        chunk
      )
    );
  };

  const filteredSuppliers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return SUPPLIERS.filter((supplier) => {
      const haystack = `${supplier.nit} ${supplier.name} ${supplier.contact} ${supplier.city} ${supplier.category}`.toLowerCase();
      const matchesSearch = !term || haystack.includes(term);
      const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;
      const matchesCity = cityFilter === 'all' || supplier.city === cityFilter;
      const matchesCategory = categoryFilter === 'all' || supplier.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCity && matchesCategory;
    });
  }, [search, statusFilter, cityFilter, categoryFilter]);

  const uniqueCities = useMemo(() => Array.from(new Set(SUPPLIERS.map((s) => s.city))), []);
  const uniqueCategories = useMemo(() => Array.from(new Set(SUPPLIERS.map((s) => s.category))), []);

  const visiblePanel = (tab: SupplierTab) => (mode === 'desktop' || activeTab === tab ? '' : 'hidden-panel');
  const balanceClass = (supplier: SupplierItem) => {
    if (supplier.balance === 0) return 'ok';
    if (supplier.overdueDays > 30) return 'danger';
    return 'warn';
  };

  const nitValid = form.nit.trim().length >= 4;
  const emailValid = /\S+@\S+\.\S+/.test(form.email);
  const nameValid = form.name.trim().length > 2;
  const canSave = isEditing && nitValid && emailValid && nameValid;

  const handleSelect = (id: string) => {
    setSelectedId(id);
    if (mode !== 'desktop') setActiveTab('detalle');
  };

  const handleDelete = () => {
    const confirmation = prompt('Para eliminar escribe "ELIMINAR"');
    if (confirmation?.toLowerCase() === 'eliminar') {
      alert('Proveedor marcado para eliminar en backend');
    }
  };

  return (
    <main className="suppliers-view app-view is-visible" id="suppliers-view" data-app-view>
      <section className="suppliers-toolbar">
        <div className="suppliers-actions">
          <button className="supplier-btn new">➕ Nuevo Proveedor</button>
          <button className="supplier-btn export">📤 Exportar</button>
          <button className="supplier-btn import">📥 Importar</button>
          <button className="supplier-btn refresh">🔄 Actualizar</button>
        </div>
        <div className="suppliers-search">
          <div className="search-box">
            <span>🔍</span>
            <input
              type="search"
              placeholder="NIT, nombre, código, contacto..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button
            className="supplier-btn"
            onClick={() => {
              setSearch(searchInput);
              alert(`Busqueda exacta de ${searchInput || 'todo'}`);
            }}
          >
            🔎 Buscar
          </button>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as SupplierStatus | 'all')}>
            <option value="all">Estado</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
            <option value="moroso">Morosos</option>
          </select>
          <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
            <option value="all">Ciudad</option>
            {uniqueCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">Categoria</option>
            {uniqueCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </section>

      <div className="suppliers-tabs">
        <button className={activeTab === 'proveedores' ? 'active' : ''} onClick={() => setActiveTab('proveedores')}>
          Proveedores
        </button>
        <button className={activeTab === 'detalle' ? 'active' : ''} onClick={() => setActiveTab('detalle')}>
          Detalle
        </button>
        <button className={activeTab === 'compras' ? 'active' : ''} onClick={() => setActiveTab('compras')}>
          Compras
        </button>
      </div>

      <div className="suppliers-grid">
        <article className={`supplier-card ${visiblePanel('proveedores')}`}>
          <header className="card-header">
            <div>
              <h2 style={{ margin: 0 }}>Lista de proveedores</h2>
              <small style={{ color: 'var(--text-muted)' }}>Cabecera fija, seleccion multiple y acciones rapidas</small>
            </div>
            <div className="filter-chip desktop-only">
              <span>Mostrar</span>
              <select>
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
            </div>
          </header>
          <div className="data-table-wrapper">
            <table className="supplier-table">
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" aria-label="Seleccionar todos" />
                  </th>
                  <th>NIT</th>
                  <th>Nombre</th>
                  <th>Contacto</th>
                  <th className="desktop-only">Ciudad</th>
                  <th className="align-right">Saldo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id} className={supplier.id === selected?.id ? 'selected' : ''} onClick={() => handleSelect(supplier.id)}>
                    <td>
                      <input type="checkbox" aria-label="Seleccionar proveedor" />
                    </td>
                    <td>{highlightText(supplier.nit)}</td>
                    <td className="supplier-name">{highlightText(supplier.name)}</td>
                    <td>{highlightText(supplier.contact)}</td>
                    <td className="desktop-only">{supplier.city}</td>
                    <td className={`balance ${balanceClass(supplier)}`}>{formatCurrency(supplier.balance)}</td>
                    <td>
                      <span className={`badge-status ${supplier.status}`}>
                        {supplier.status === 'activo' ? '✅' : supplier.status === 'moroso' ? '🔴' : '⚫'} {supplier.status}
                      </span>
                    </td>
                    <td>
                      <div className="supplier-actions">
                        <button title="Llamar">📞</button>
                        <button title="Email">📧</button>
                        <button title="WhatsApp">📝</button>
                        <button title="Editar" onClick={() => setIsEditing(true)}>
                          ✏️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {mode !== 'desktop' ? <div className="mobile-only">Cargar mas...</div> : null}
          </div>
        </article>

        <article className={`supplier-detail ${visiblePanel('detalle')}`}>
          <div className="detail-header">
            <div>
              <h3 style={{ margin: 0 }}>Ficha proveedor</h3>
              <small style={{ color: 'var(--text-muted)' }}>{selected?.name}</small>
            </div>
            <button className="supplier-btn" onClick={() => setIsEditing((prev) => !prev)}>
              {isEditing ? 'Cancelar edicion' : '✏️ Editar'}
            </button>
          </div>

          <div className="detail-kpis">
            {SUPPLIER_KPIS.map((kpi) => (
              <div className="mini-kpi" key={kpi.label}>
                <small style={{ color: 'var(--text-muted)' }}>{kpi.label}</small>
                <strong>{kpi.value}</strong>
              </div>
            ))}
          </div>

          <div className="detail-grid">
            <label>
              NIT
              <input value={form.nit} onChange={(e) => setForm((prev) => ({ ...prev, nit: e.target.value }))} readOnly={!isEditing} />
              <small style={{ color: nitValid ? 'var(--supplier-green)' : 'var(--supplier-red)' }}>
                {nitValid ? 'Formato correcto' : 'Esperando formato valido'}
              </small>
            </label>
            <label>
              Nombre
              <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value.toUpperCase() }))} readOnly={!isEditing} />
            </label>
            <label>
              Contacto
              <input value={form.contact} onChange={(e) => setForm((prev) => ({ ...prev, contact: e.target.value }))} readOnly={!isEditing} />
            </label>
            <label>
              Telefono
              <input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} readOnly={!isEditing} />
            </label>
            <label>
              Email
              <input value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} readOnly={!isEditing} />
              <small style={{ color: emailValid ? 'var(--supplier-green)' : 'var(--supplier-red)' }}>
                {emailValid ? '✓ Email valido' : '✗ Revisar email'}
              </small>
            </label>
            <label>
              Direccion
              <textarea value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} readOnly={!isEditing} />
            </label>
            <label>
              Ciudad
              <select value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} disabled={!isEditing}>
                {uniqueCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Categoria
              <select value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} disabled={!isEditing}>
                {uniqueCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Dias credito ({form.creditDays})
              <input
                type="range"
                min={0}
                max={90}
                value={form.creditDays}
                onChange={(e) => setForm((prev) => ({ ...prev, creditDays: Number(e.target.value) }))}
                disabled={!isEditing}
              />
            </label>
            <label>
              Limite credito
              <input
                value={form.creditLimit}
                onChange={(e) => setForm((prev) => ({ ...prev, creditLimit: Number(e.target.value) }))}
                readOnly={!isEditing}
              />
            </label>
            <label>
              Estado
              <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as SupplierStatus }))} disabled={!isEditing}>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="moroso">Moroso</option>
              </select>
            </label>
          </div>

          <div className="detail-actions">
            <button className="primary" disabled={!canSave} onClick={() => setIsEditing(false)}>
              💾 Guardar
            </button>
            <button onClick={resetForm} disabled={!isEditing}>
              ❌ Cancelar
            </button>
            <button className="danger" onClick={handleDelete}>
              🗑️ Eliminar
            </button>
            <button onClick={() => alert('Ver historial completo')}>📊 Ver Hist. Compras</button>
          </div>
        </article>
      </div>

      <article className={`purchase-card ${visiblePanel('compras')}`}>
        <header className="card-header">
          <h3 style={{ margin: 0 }}>Record de compras rapido</h3>
          <button className="supplier-btn" onClick={() => alert('Ir a reporte detallado')}>📈 Reporte</button>
        </header>
        <ul>
          {SUPPLIER_PURCHASES.map((row) => (
            <li key={row.document} className="purchase-row">
              <div>
                <strong>{row.date}</strong> {row.document}
                <div className="purchase-meta">Ultimas 5 compras</div>
              </div>
              <div className="balance">{formatCurrency(row.amount)}</div>
              <span className={`purchase-status ${row.status}`}>{row.status}</span>
            </li>
          ))}
        </ul>
      </article>

      <article className="report-card">
        <header className="card-header">
          <div>
            <h3 style={{ margin: 0 }}>Reporte: Compras por proveedor</h3>
            <small style={{ color: 'var(--text-muted)' }}>Filtros rapidos y KPIs</small>
          </div>
          <div className="suppliers-actions">
            <select className="supplier-btn">
              <option>Fecha inicio</option>
              <option>01/11/2024</option>
            </select>
            <select className="supplier-btn">
              <option>Fecha fin</option>
              <option>22/11/2024</option>
            </select>
            <button className="supplier-btn export">📤 PDF/Excel</button>
          </div>
        </header>

        <div className="report-grid">
          {SUPPLIER_KPIS.map((kpi) => (
            <div className="mini-kpi" key={kpi.label}>
              <small style={{ color: 'var(--text-muted)' }}>{kpi.label}</small>
              <strong>{kpi.value}</strong>
            </div>
          ))}
        </div>

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
      </article>
    </main>
  );
};

export default SuppliersView;
