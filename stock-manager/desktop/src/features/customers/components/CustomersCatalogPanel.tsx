import { memo, useMemo } from 'react';
import { formatCurrency } from '@/shared/utils/format';
import type { CustomerItem } from '@/shared/types/customers';
import { DataTable, type Column } from '@/ui/molecules/Table/DataTable';

type Props = {
  customers: CustomerItem[];
  selectedId: number | null;
  search: string;
  filtersSummary: string;
  onSearchChange: (value: string) => void;
  onSelect: (id: number) => void;
  onEdit: (id: number) => void;
  onCreate: () => void;
  onClearFilters: () => void;
  loading?: boolean;
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const highlight = (text: string, term: string) => {
  if (!term) return text;
  const regex = new RegExp(`(${escapeRegExp(term)})`, 'ig');
  return (
    <span>
      {text.split(regex).map((chunk, idx) =>
        chunk.toLowerCase() === term.toLowerCase() ? (
          <mark key={`${chunk}-${idx}`} className="highlight-term">
            {chunk}
          </mark>
        ) : (
          chunk
        )
      )}
    </span>
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
  const columns: Column<CustomerItem>[] = useMemo(
    () => [
      {
        key: 'select',
        header: 'CB',
        render: (item) => (
          <input
            type="checkbox"
            aria-label={`Seleccionar ${item.name}`}
            checked={item.id === selectedId}
            readOnly
          />
        ),
        sortable: false,
        className: 'w-10 text-center',
      },
      {
        key: 'nit',
        header: 'NIT',
        accessor: (item) => highlight(item.nit, search),
        sortable: true,
      },
      {
        key: 'name',
        header: 'Nombre',
        accessor: (item) => highlight(item.name, search),
        sortable: true,
      },
      {
        key: 'phone',
        header: 'Contacto',
        accessor: 'phone',
        sortable: true,
      },
      {
        key: 'city',
        header: 'Ciudad',
        accessor: 'city',
        sortable: true,
      },
      {
        key: 'credit',
        header: 'Credito',
        render: (item) => (
          <span className={`balance ${creditBadge(item)}`}>
            {item.hasCredit
              ? `${formatCurrency(item.creditUsed)} / ${formatCurrency(
                item.creditLimit
              )}`
              : 'Sin credito'}
          </span>
        ),
        sortable: true,
        className: 'align-right',
        headerClassName: 'align-right',
      },
      {
        key: 'status',
        header: 'Estado',
        render: (item) => (
          <span className={`badge-status ${item.status}`}>{item.status}</span>
        ),
        sortable: true,
      },
      {
        key: 'actions',
        header: 'Acciones',
        render: (item) => (
          <div className="supplier-actions">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item.id);
              }}
            >
              ✏️
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                alert('Llamar');
              }}
            >
              📞
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                alert('Email');
              }}
            >
              📧
            </button>
          </div>
        ),
        sortable: false,
      },
    ],
    [selectedId, search, onEdit]
  );

  return (
    <section className="customer-card">
      <header className="card-header">
        <div>
          <h2 style={{ margin: 0 }}>Catalogo de clientes</h2>
          <small style={{ color: 'var(--text-muted)' }}>
            {filtersSummary || 'Todos los clientes'}
          </small>
        </div>
        <div className="search-box">
          <input
            placeholder="Buscar NIT, nombre, ciudad..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <button className="customer-btn ghost" onClick={onClearFilters}>
            Limpiar
          </button>
        </div>
      </header>

      <DataTable
        data={customers}
        columns={columns}
        keyField="id"
        selectedId={selectedId?.toString()}
        onSelect={(id) => onSelect(Number(id))}
        onDoubleClick={(item) => onEdit(item.id)}
        loading={loading}
        emptyMessage="No se encontraron clientes."
      />

      {!loading && customers.length === 0 && (
        <div className="p-4 text-center">
          <button className="customer-btn new" onClick={onCreate}>
            Crear
          </button>
        </div>
      )}
    </section>
  );
};

export default memo(CustomersCatalogPanel);

