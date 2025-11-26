import { formatCurrency } from '@/shared/utils/format';
import type { SupplierItem } from '@/shared/types/suppliers';
import SupplierActionsCell from './SupplierActionsCell';

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

const balanceClass = (supplier: SupplierItem) => {
  if (supplier.balance === 0) return 'ok';
  if (supplier.overdueDays > 30) return 'danger';
  return 'warn';
};

const SupplierListPanel = ({ suppliers, selectedId, onSelect, onEdit, onOpenDetail, loading, searchTerm, onCreate, onDelete }: SupplierListPanelProps) => {
  const hasResults = suppliers.length > 0;

  return (
    <article className="supplier-card">
      <header className="card-header">
        <div>
          <h2 style={{ margin: 0 }}>Lista de proveedores</h2>
          <small style={{ color: 'var(--text-muted)' }}>Cabecera fija, seleccion multiple y acciones rapidas</small>
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
            {!loading && !hasResults && (
              <tr>
                <td colSpan={8} className="muted">
                  No se encontraron proveedores.{' '}
                  <button className="supplier-btn new" onClick={onCreate}>
                    Crear primero
                  </button>
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={8} className="muted">
                  Cargando proveedores...
                </td>
              </tr>
            )}
            {suppliers.map((supplier) => (
              <tr
                key={supplier.id}
                className={supplier.id === selectedId ? 'selected' : ''}
                onClick={() => onSelect(supplier.id)}
                onDoubleClick={() => onOpenDetail?.(supplier.id)}
              >
                <td>
                  <input type="checkbox" aria-label="Seleccionar proveedor" checked={supplier.id === selectedId} readOnly />
                </td>
                <td>{highlight(supplier.nit, searchTerm)}</td>
                <td className="supplier-name">{highlight(supplier.name, searchTerm)}</td>
                <td>{highlight(supplier.contactName, searchTerm)}</td>
                <td className="desktop-only">{supplier.cityName ?? supplier.cityId}</td>
                <td className={`balance ${balanceClass(supplier)}`}>{formatCurrency(supplier.balance)}</td>
                <td>
                  <span className={`badge-status ${supplier.status}`}>
                    {supplier.status === 'activo' ? '✅' : supplier.status === 'moroso' ? '🔴' : '⚫'} {supplier.status}
                  </span>
                </td>
                <td>
                  <SupplierActionsCell
                    onEdit={() => onEdit(supplier.id)}
                    onDelete={() => onDelete?.(supplier.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && hasResults && suppliers.length < 5 && <div className="muted">Resultados limitados, ajusta los filtros.</div>}
      </div>
    </article>
  );
};

export default SupplierListPanel;
