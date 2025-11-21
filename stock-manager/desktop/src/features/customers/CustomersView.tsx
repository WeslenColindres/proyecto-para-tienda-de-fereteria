import { useEffect, useMemo, useState } from 'react';
import { DESKTOP_BREAKPOINT, TABLET_BREAKPOINT } from '@/shared/constants/layout';
import { CUSTOMER_CREDIT_REPORT, CUSTOMERS, CUSTOMER_SALES } from '@/shared/data/customers';
import type { CustomerItem, CustomerStatus } from '@/shared/types/customers';
import { formatCurrency } from '@/shared/utils/format';

type CustomerTab = 'clientes' | 'detalle' | 'ventas' | 'credito';
type ViewportMode = 'desktop' | 'tablet' | 'mobile';

type CustomerFormState = {
  nit: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  type: CustomerItem['type'];
  hasCredit: boolean;
  creditLimit: number;
  creditUsed: number;
  discount: number;
  notes: string;
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const CustomersView = () => {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | CustomerStatus>('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | CustomerItem['type']>('all');
  const [creditFilter, setCreditFilter] = useState<'all' | 'con' | 'sin'>('all');
  const [activeTab, setActiveTab] = useState<CustomerTab>('clientes');
  const [mode, setMode] = useState<ViewportMode>('desktop');
  const [selectedId, setSelectedId] = useState(CUSTOMERS[0]?.id ?? '');
  const [isEditing, setIsEditing] = useState(false);
  const selected = useMemo(() => CUSTOMERS.find((c) => c.id === selectedId) ?? CUSTOMERS[0], [selectedId]);
  const [form, setForm] = useState<CustomerFormState>(() => {
    const customer = selected ?? CUSTOMERS[0];
    return {
      nit: customer?.nit ?? '',
      name: customer?.name ?? '',
      phone: customer?.phone ?? '',
      email: customer?.email ?? '',
      city: customer?.city ?? '',
      type: customer?.type ?? 'persona-natural',
      hasCredit: customer?.hasCredit ?? false,
      creditLimit: customer?.creditLimit ?? 0,
      creditUsed: customer?.creditUsed ?? 0,
      discount: customer?.discount ?? 0,
      notes: 'Notas rapidas para el cliente'
    };
  });

  const resetForm = () => {
    if (!selected) return;
    setForm({
      nit: selected.nit,
      name: selected.name,
      phone: selected.phone,
      email: selected.email,
      city: selected.city,
      type: selected.type,
      hasCredit: selected.hasCredit,
      creditLimit: selected.creditLimit,
      creditUsed: selected.creditUsed,
      discount: selected.discount,
      notes: 'Notas rapidas para el cliente'
    });
    setIsEditing(false);
  };

  useEffect(() => {
    const onResize = () => {
      const width = window.innerWidth;
      const nextMode: ViewportMode = width >= DESKTOP_BREAKPOINT ? 'desktop' : width >= TABLET_BREAKPOINT ? 'tablet' : 'mobile';
      setMode(nextMode);
      if (nextMode === 'desktop') setActiveTab('clientes');
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
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

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return CUSTOMERS.filter((customer) => {
      const haystack = `${customer.nit} ${customer.name} ${customer.phone} ${customer.email}`.toLowerCase();
      const matchesSearch = !term || haystack.includes(term);
      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
      const matchesCity = cityFilter === 'all' || customer.city === cityFilter;
      const matchesType = typeFilter === 'all' || customer.type === typeFilter;
      const matchesCredit = creditFilter === 'all' || (creditFilter === 'con' ? customer.hasCredit : !customer.hasCredit);
      return matchesSearch && matchesStatus && matchesCity && matchesType && matchesCredit;
    });
  }, [search, statusFilter, cityFilter, typeFilter, creditFilter]);

  const uniqueCities = useMemo(() => Array.from(new Set(CUSTOMERS.map((c) => c.city))), []);

  const visiblePanel = (tab: CustomerTab) => (mode === 'desktop' || activeTab === tab ? '' : 'hidden-panel');
  const creditUsage = form.creditLimit ? Math.round((form.creditUsed / form.creditLimit) * 100) : 0;
  const emailValid = /\S+@\S+\.\S+/.test(form.email);
  const nitValid = form.nit.trim().length >= 2;
  const nameValid = form.name.trim().length > 2;
  const canSave = isEditing && emailValid && nitValid && nameValid;

  const handleSelect = (id: string) => {
    setSelectedId(id);
    if (mode !== 'desktop') setActiveTab('detalle');
  };

  return (
    <main className="customers-view app-view is-visible" id="customers-view" data-app-view>
      <section className="customers-toolbar">
        <div className="customers-actions">
          <button className="customer-btn new">➕ Nuevo Cliente</button>
          <button className="customer-btn export">📤 Exportar</button>
          <button className="customer-btn import">📥 Importar</button>
          <button className="customer-btn bonus">🎁 Descuentos</button>
        </div>
        <div className="customers-search">
          <input
            type="search"
            placeholder="NIT, nombre, telefono..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button
            className="customer-btn"
            onClick={() => {
              setSearch(searchInput);
              alert(`Buscar ${searchInput || 'todos'}`);
            }}
          >
            🔎 Buscar
          </button>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as CustomerStatus | 'all')}>
            <option value="all">Estado</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
            <option value="credito">Credito</option>
            <option value="contado">Contado</option>
          </select>
          <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
            <option value="all">Ciudad</option>
            {uniqueCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as CustomerItem['type'] | 'all')}>
            <option value="all">Tipo</option>
            <option value="persona-natural">Persona Natural</option>
            <option value="persona-juridica">Persona Juridica</option>
            <option value="extranjero">Extranjero</option>
          </select>
          <select value={creditFilter} onChange={(e) => setCreditFilter(e.target.value as typeof creditFilter)}>
            <option value="all">Credito</option>
            <option value="con">Con credito</option>
            <option value="sin">Sin credito</option>
          </select>
        </div>
      </section>

      <div className="customer-tabs">
        <button className={activeTab === 'clientes' ? 'active' : ''} onClick={() => setActiveTab('clientes')}>
          Clientes
        </button>
        <button className={activeTab === 'detalle' ? 'active' : ''} onClick={() => setActiveTab('detalle')}>
          Detalle
        </button>
        <button className={activeTab === 'ventas' ? 'active' : ''} onClick={() => setActiveTab('ventas')}>
          Ventas
        </button>
        <button className={activeTab === 'credito' ? 'active' : ''} onClick={() => setActiveTab('credito')}>
          Credito
        </button>
      </div>

      <div className="customers-grid">
        <article className={`customer-card ${visiblePanel('clientes')}`}>
          <header className="card-header">
            <div>
              <h2 style={{ margin: 0 }}>Lista de clientes</h2>
              <small style={{ color: 'var(--text-muted)' }}>Tabla con paginacion y tarjetas responsivas</small>
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
            <table className="customer-table">
              <thead>
                <tr>
                  <th>
                    <input type="checkbox" aria-label="Seleccionar todos los clientes" />
                  </th>
                  <th>NIT</th>
                  <th>Nombre</th>
                  <th>Telefono</th>
                  <th>Credito</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => {
                  const available = Math.max(customer.creditLimit - customer.creditUsed, 0);
                  return (
                    <tr key={customer.id} className={customer.id === selected?.id ? 'selected' : ''} onClick={() => handleSelect(customer.id)}>
                      <td>
                        <input type="checkbox" aria-label="Seleccionar cliente" />
                      </td>
                      <td>{highlightText(customer.nit)}</td>
                      <td className="customer-name">{highlightText(customer.name)}</td>
                      <td>{customer.phone}</td>
                      <td className="align-right">{customer.hasCredit ? formatCurrency(available) : 'Contado'}</td>
                      <td>
                        <span className={`customer-status ${customer.status}`}>{customer.status}</span>
                      </td>
                      <td>
                        <div className="customer-actions">
                          <button title="Llamar">📞</button>
                          <button title="Credito">💳</button>
                          <button title="Nueva venta">🛒</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="alert-banner">🚨 Alertas: 3 clientes proximo limite</div>
        </article>

        <article className={`customer-detail ${visiblePanel('detalle')}`}>
          <div className="detail-header">
            <div>
              <h3 style={{ margin: 0 }}>Ficha cliente</h3>
              <small style={{ color: 'var(--text-muted)' }}>{selected?.name}</small>
            </div>
            <button className="customer-btn" onClick={() => setIsEditing((prev) => !prev)}>
              {isEditing ? 'Cancelar edicion' : '✏️ Editar'}
            </button>
          </div>

          <div className="detail-grid">
            <label>
              NIT
              <input value={form.nit} onChange={(e) => setForm((prev) => ({ ...prev, nit: e.target.value }))} readOnly={!isEditing} />
              <small style={{ color: nitValid ? 'var(--customer-green)' : 'var(--customer-red)' }}>
                {nitValid ? 'Formato OK' : 'Falta validar NIT'}
              </small>
            </label>
            <label>
              Nombre
              <input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value.toUpperCase() }))}
                readOnly={!isEditing}
              />
            </label>
            <label>
              Telefono
              <input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} readOnly={!isEditing} />
            </label>
            <label>
              Email
              <input value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} readOnly={!isEditing} />
              <small style={{ color: emailValid ? 'var(--customer-green)' : 'var(--customer-red)' }}>
                {emailValid ? '✓ Email' : '✗ Revisar formato'}
              </small>
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
              Tipo
              <select value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as CustomerItem['type'] }))} disabled={!isEditing}>
                <option value="persona-natural">Persona Natural</option>
                <option value="persona-juridica">Persona Juridica</option>
                <option value="extranjero">Extranjero</option>
              </select>
            </label>
            <label>
              Notas
              <textarea value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} readOnly={!isEditing} />
            </label>
            <label>
              Cliente tiene credito
              <input
                type="checkbox"
                checked={form.hasCredit}
                onChange={(e) => setForm((prev) => ({ ...prev, hasCredit: e.target.checked }))}
                disabled={!isEditing}
              />
            </label>
            {form.hasCredit ? (
              <>
                <label>
                  Limite de credito
                  <input
                    type="number"
                    value={form.creditLimit}
                    onChange={(e) => setForm((prev) => ({ ...prev, creditLimit: Number(e.target.value) }))}
                    readOnly={!isEditing}
                  />
                </label>
                <label>
                  Usado
                  <input
                    type="number"
                    value={form.creditUsed}
                    onChange={(e) => setForm((prev) => ({ ...prev, creditUsed: Number(e.target.value) }))}
                    readOnly={!isEditing}
                  />
                  <div className="progress">
                    <span style={{ width: `${Math.min(creditUsage, 100)}%` }}></span>
                  </div>
                  <small style={{ color: 'var(--text-muted)' }}>Uso actual: {creditUsage}%</small>
                </label>
              </>
            ) : null}
            <label>
              Descuento (%)
              <input
                type="number"
                value={form.discount}
                onChange={(e) => setForm((prev) => ({ ...prev, discount: Number(e.target.value) }))}
                readOnly={!isEditing}
              />
            </label>
          </div>

          <div className="detail-actions">
            <button className="primary" disabled={!canSave} onClick={() => setIsEditing(false)}>
              💾 Guardar
            </button>
            <button onClick={resetForm} disabled={!isEditing}>
              ❌ Cancelar
            </button>
            <button className="danger" onClick={() => alert('Eliminar cliente con doble confirmacion')}>
              🗑️ Eliminar
            </button>
          </div>
        </article>
      </div>

      <article className={`sales-card ${visiblePanel('ventas')}`}>
        <header className="card-header">
          <h3 style={{ margin: 0 }}>Historial de ventas rapido</h3>
          <button className="customer-btn" onClick={() => alert('Ver historial completo')}>
            📊 Ver Historial
          </button>
        </header>
        <div className="sales-list">
          {CUSTOMER_SALES.map((sale) => (
            <div key={sale.document} className="sales-row">
              <div>
                <strong>{sale.date}</strong> {sale.document}
                <div className="sale-meta">
                  {sale.type} • {sale.status}
                </div>
              </div>
              <div className="balance">{formatCurrency(sale.amount)}</div>
              <span className={`sale-status ${sale.status}`}>{sale.status}</span>
            </div>
          ))}
        </div>
      </article>

      <article className={`credit-card ${visiblePanel('credito')}`}>
        <header className="card-header">
          <div>
            <h3 style={{ margin: 0 }}>Credito y limites</h3>
            <small style={{ color: 'var(--text-muted)' }}>Clientes con credito activo</small>
          </div>
          <button className="customer-btn" onClick={() => alert('Reporte de creditos')}>
            💳 Reporte
          </button>
        </header>
        <div className="credit-grid">
          {CUSTOMER_CREDIT_REPORT.map((row) => {
            const percent = row.limit ? Math.round((row.used / row.limit) * 100) : 0;
            const dueColor = row.daysToDue < 0 ? 'var(--customer-red)' : row.daysToDue < 10 ? 'var(--customer-gold)' : 'var(--customer-green)';
            return (
              <div key={row.customer} className="credit-pill">
                <strong>{row.customer}</strong>
                <div className="sale-meta">
                  Limite {formatCurrency(row.limit)} • Usado {formatCurrency(row.used)} • Disponible {formatCurrency(row.available)}
                </div>
                <div className="progress">
                  <span style={{ width: `${Math.min(percent, 100)}%` }}></span>
                </div>
                <small style={{ color: dueColor }}>
                  {row.daysToDue < 0 ? `Vencido hace ${Math.abs(row.daysToDue)} dias` : `Vence en ${row.daysToDue} dias`}
                </small>
              </div>
            );
          })}
        </div>
      </article>

      <article className="discount-card">
        <header className="card-header">
          <h3 style={{ margin: 0 }}>Descuentos especiales</h3>
          <button className="customer-btn bonus">💾 Guardar configuracion</button>
        </header>
        <div className="discount-grid">
          <section>
            <strong>Descuento general</strong>
            <p style={{ margin: '6px 0' }}>Aplicado a todos los productos</p>
            <input
              type="number"
              value={form.discount}
              onChange={(e) => setForm((prev) => ({ ...prev, discount: Number(e.target.value) }))}
              readOnly={!isEditing}
            />
          </section>
          <section>
            <strong>Por categoria</strong>
            <table className="discount-table">
              <thead>
                <tr>
                  <th>Categoria</th>
                  <th>Descuento</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Panaderia</td>
                  <td>5%</td>
                  <td>[✏️][🗑️]</td>
                </tr>
                <tr>
                  <td>Bebidas</td>
                  <td>3%</td>
                  <td>[✏️][🗑️]</td>
                </tr>
              </tbody>
            </table>
          </section>
          <section>
            <strong>Productos especiales</strong>
            <p style={{ margin: '6px 0' }}>Lista de excepciones</p>
            <button className="customer-btn bonus">➕ Agregar producto</button>
          </section>
        </div>
      </article>
    </main>
  );
};

export default CustomersView;
