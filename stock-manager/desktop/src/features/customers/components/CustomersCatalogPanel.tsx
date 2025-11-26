import { memo } from 'react';
import { formatCurrency } from '@/shared/utils/format';
import type { CustomerItem } from '@/shared/types/customers';

type Props = {
  customers: CustomerItem[];
  selectedId: string | null;
  search: string;
  filtersSummary: string;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onCreate: () => void;
  onClearFilters: () => void;
  loading?: boolean;
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const highlight = (text: string, term: string) => {
  if (!term) return text;
  const regex = new RegExp(`(${escapeRegExp(term)})`, 'ig');
  return text.split(regex).map((chunk, idx) =>
    chunk.toLowerCase() === term.toLowerCase() ? (
      <mark key={`${chunk}-${idx}`} className="highlight-term">
        {chunk}
      </mark>
    ) : (
      chunk
    ),
  );
};

const creditBadge = (customer: CustomerItem) => {
  if (!customer.hasCredit) return 'sin-credito';
  if (customer.creditUsed >= customer.creditLimit) return 'critico';
  if (customer.creditUsed / customer.creditLimit > 0.7) return 'alerta';
  return 'ok';
};

const CustomersCatalogPanel = ({
  customers,
  selectedId,
  search,
  filtersSummary,
  onSearchChange,
  onSelect,
  onEdit,
  onCreate,
  onClearFilters,
  loading,
}: Props) => {
  return (
    <section className="customer-card">
      <header className="card-header">
        <div>
          <h2 style={{ margin: 0 }}>Catalogo de clientes</h2>
          <small style={{ color: 'var(--text-muted)' }}>{filtersSummary || 'Todos los clientes'}</small>
        </div>
        <div className="search-box">
          <input placeholder="Buscar NIT, nombre, ciudad..." value={search} onChange={(e) => onSearchChange(e.target.value)} />
          <button className="customer-btn ghost" onClick={onClearFilters}>
            Limpiar
          </button>
        </div>
      </header>
      <div className="data-table-wrapper">
        <table className="customer-table">
          <thead>
            <tr>
              <th>CB</th>
              <th>NIT</th>
              <th>Nombre</th>
              <th>Contacto</th>
              <th>Ciudad</th>
              <th className="align-right">Credito</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {!loading && customers.length === 0 && (
              <tr>
                <td colSpan={8} className="muted">
                  No se encontraron clientes.
                  <button className="customer-btn new" onClick={onCreate}>
                    Crear
                  </button>
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={8} className="muted">
                  Cargando clientes...
                </td>
              </tr>
            )}
            {customers.map((customer) => (
              <tr key={customer.id} className={customer.id === selectedId ? 'selected' : ''} onClick={() => onSelect(customer.id)} onDoubleClick={() => onEdit(customer.id)}>
                <td>
                  <input type="checkbox" aria-label={`Seleccionar ${customer.name}`} checked={customer.id === selectedId} readOnly />
                </td>
                <td>{highlight(customer.nit, search)}</td>
                <td>{highlight(customer.name, search)}</td>
                <td>{customer.phone}</td>
                <td>{customer.city}</td>
                <td className={`balance ${creditBadge(customer)}`}>
                  {customer.hasCredit ? `${formatCurrency(customer.creditUsed)} / ${formatCurrency(customer.creditLimit)}` : 'Sin credito'}
                </td>
                <td>
                  <span className={`badge-status ${customer.status}`}>{customer.status}</span>
                </td>
                <td>
                  <div className="supplier-actions">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(customer.id); }}>✏️</button>
                    <button onClick={(e) => { e.stopPropagation(); alert('Llamar'); }}>📞</button>
                    <button onClick={(e) => { e.stopPropagation(); alert('Email'); }}>📧</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default memo(CustomersCatalogPanel);
