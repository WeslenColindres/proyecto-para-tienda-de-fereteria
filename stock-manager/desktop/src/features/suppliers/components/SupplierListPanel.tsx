import { useMemo } from 'react';
import { formatCurrency } from '@/shared/utils/format';
import type { SupplierItem } from '@/shared/types/suppliers';
import SupplierActionsCell from './SupplierActionsCell';
import { DataTable, type Column } from '@/ui/molecules/Table/DataTable';

type SupplierListPanelProps = {
  suppliers: SupplierItem[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onOpenDetail?: (id: string) => void;
  loading?: boolean;
  searchTerm?: string;
  onCreate?: () => void;
  onDelete?: (id: string) => void;
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const highlight = (text: string, term?: string) => {
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

const balanceClass = (supplier: SupplierItem) => {
  if (supplier.balance === 0) return 'ok';
  if (supplier.overdueDays > 30) return 'danger';
  return 'warn';
};

const SupplierListPanel = ({
  suppliers,
  selectedId,
  onSelect,
  onEdit,
  onOpenDetail,
  loading,
  searchTerm,
  onCreate,
  onDelete,
}: SupplierListPanelProps) => {
  const columns: Column<SupplierItem>[] = useMemo(
    () => [
      {
        key: 'select',
        header: '',
        render: (item) => (
          <input
            type="checkbox"
            aria-label="Seleccionar proveedor"
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
        accessor: (item) => highlight(item.nit, searchTerm),
        sortable: true,
      },
      {
        key: 'name',
        header: 'Nombre',
        accessor: (item) => highlight(item.name, searchTerm),
        sortable: true,
        className: 'supplier-name font-medium',
      },
      {
        key: 'contactName',
        header: 'Contacto',
        accessor: (item) => highlight(item.contactName, searchTerm),
        sortable: true,
      },
      {
        key: 'cityName',
        header: 'Ciudad',
        accessor: (item) => item.cityName ?? item.cityId,
        sortable: true,
        className: 'desktop-only',
        headerClassName: 'desktop-only',
      },
      {
        key: 'balance',
        header: 'Saldo',
        render: (item) => (
          <span className={`balance ${balanceClass(item)}`}>
            {formatCurrency(item.balance)}
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
          <span className={`badge-status ${item.status}`}>
            {item.status === 'activo'
              ? '✅'
              : item.status === 'moroso'
                ? '🔴'
                : '⚫'}{' '}
            {item.status}
          </span>
        ),
        sortable: true,
      },
      {
        key: 'actions',
        header: 'Acciones',
        render: (item) => (
          <SupplierActionsCell
            onEdit={() => onEdit(item.id)}
            onDelete={() => onDelete?.(item.id)}
          />
        ),
        sortable: false,
      },
    ],
    [selectedId, searchTerm, onEdit, onDelete]
  );

  return (
    <article className="supplier-card">
      <header className="card-header">
        <div>
          <h2 style={{ margin: 0 }}>Lista de proveedores</h2>
          <small style={{ color: 'var(--text-muted)' }}>
            Cabecera fija, seleccion multiple y acciones rapidas
          </small>
        </div>
        {!loading && suppliers.length === 0 && (
          <button className="supplier-btn new" onClick={onCreate}>
            Crear primero
          </button>
        )}
      </header>

      <DataTable
        data={suppliers}
        columns={columns}
        keyField="id"
        selectedId={selectedId}
        onSelect={onSelect}
        onDoubleClick={(item) => onOpenDetail?.(item.id)}
        loading={loading}
        emptyMessage="No se encontraron proveedores."
      />

      {!loading && suppliers.length > 0 && suppliers.length < 5 && (
        <div className="muted p-4">Resultados limitados, ajusta los filtros.</div>
      )}
    </article>
  );
};

export default SupplierListPanel;

