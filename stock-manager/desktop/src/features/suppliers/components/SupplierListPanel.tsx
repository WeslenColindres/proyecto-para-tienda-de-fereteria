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
  if (supplier.balance === 0) return 'text-green-600 font-medium';
  if (supplier.overdueDays > 30) return 'text-red-600 font-bold';
  return 'text-orange-500 font-medium';
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
            className="rounded border-subtle text-blue-600 focus:ring-blue-500 bg-panel-strong"
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
        className: 'font-mono text-sm text-muted',
      },
      {
        key: 'name',
        header: 'Nombre',
        accessor: (item) => highlight(item.name, searchTerm),
        sortable: true,
        className: 'font-medium text-primary',
      },
      {
        key: 'contactName',
        header: 'Contacto',
        accessor: (item) => highlight(item.contactName, searchTerm),
        sortable: true,
        className: 'text-secondary',
      },
      {
        key: 'cityName',
        header: 'Ciudad',
        accessor: (item) => item.cityName ?? item.cityId,
        sortable: true,
        className: 'hidden md:table-cell text-muted',
        headerClassName: 'hidden md:table-cell',
      },
      {
        key: 'balance',
        header: 'Saldo',
        render: (item) => (
          <span className={balanceClass(item)}>
            {formatCurrency(item.balance)}
          </span>
        ),
        sortable: true,
        className: 'text-right',
        headerClassName: 'text-right',
      },
      {
        key: 'status',
        header: 'Estado',
        render: (item) => (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
            ${item.status === 'activo' ? 'badge-success' :
              item.status === 'moroso' ? 'badge-danger' :
                item.status === 'bloqueado' ? 'badge-neutral' :
                  'badge-neutral'}`}>
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
        className: 'w-20 text-center',
      },
    ],
    [selectedId, searchTerm, onEdit, onDelete]
  );

  return (
    <article className="bg-panel rounded-lg shadow-sm border border-subtle overflow-hidden flex flex-col h-full">
      <header className="px-6 py-4 border-b border-subtle flex justify-between items-center bg-panel-soft">
        <div>
          <h2 className="text-lg font-semibold text-primary m-0">Lista de proveedores</h2>
          <p className="text-sm text-muted mt-1">
            Gestione sus proveedores y cuentas por pagar
          </p>
        </div>
        {!loading && suppliers.length === 0 && (
          <button
            className="px-4 py-2 btn-primary rounded-lg transition-colors text-sm font-medium shadow-sm"
            onClick={onCreate}
          >
            Crear primero
          </button>
        )}
      </header>

      <div className="flex-1 overflow-hidden">
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
      </div>

      {!loading && suppliers.length > 0 && suppliers.length < 5 && (
        <div className="px-6 py-3 bg-panel-soft border-t border-subtle text-xs text-muted text-center">
          Mostrando {suppliers.length} resultados
        </div>
      )}
    </article>
  );
};

export default SupplierListPanel;

