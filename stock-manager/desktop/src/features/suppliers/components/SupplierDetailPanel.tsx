import SupplierForm from './SupplierForm';
import type { SupplierItem, SupplierCatalogs } from '@/shared/types/suppliers';
import type { SupplierFormState } from '../hooks/useSuppliers';

type SupplierDetailPanelProps = {
  supplier?: SupplierItem;
  form: SupplierFormState;
  onChange: (next: SupplierFormState) => void;
  isEditing: boolean;
  onToggleEditing: () => void;
  onSave: () => void;
  onReset: () => void;
  onDelete: () => void;
  onHistory: () => void;
  catalogs: SupplierCatalogs;
  kpis: Array<{ label: string; value: string }>;
};

const SupplierDetailPanel = ({
  supplier,
  form,
  onChange,
  isEditing,
  onToggleEditing,
  onSave,
  onReset,
  onDelete,
  onHistory,
  catalogs,
  kpis,
}: SupplierDetailPanelProps) => {
  const canSave = isEditing && form.nit.trim().length >= 4 && /\S+@\S+\.\S+/.test(form.email) && form.name.trim().length > 2;

  return (
    <article className="supplier-detail">
      <div className="detail-header">
        <div>
          <h3 style={{ margin: 0 }}>Ficha proveedor</h3>
          <small style={{ color: 'var(--text-muted)' }}>{supplier?.name ?? 'Selecciona un proveedor'}</small>
        </div>
        <button className="supplier-btn" onClick={onToggleEditing}>
          {isEditing ? 'Cancelar edicion' : '✏️ Editar'}
        </button>
      </div>

      <div className="detail-kpis">
        {kpis.map((kpi) => (
          <div className="mini-kpi" key={kpi.label}>
            <small style={{ color: 'var(--text-muted)' }}>{kpi.label}</small>
            <strong>{kpi.value}</strong>
          </div>
        ))}
      </div>

      <SupplierForm
        form={form}
        onChange={(next) => onChange({ ...form, ...next })}
        catalogs={catalogs}
        readOnly={!isEditing}
        showValidation={isEditing}
      />

      <div className="detail-actions">
        <button className="primary" disabled={!canSave} onClick={onSave}>
          💾 Guardar
        </button>
        <button onClick={onReset} disabled={!isEditing}>
          ❌ Cancelar
        </button>
        <button className="danger" onClick={onDelete}>
          🗑️ Eliminar
        </button>
        <button onClick={onHistory}>📊 Ultimas compras</button>
      </div>
    </article>
  );
};

export default SupplierDetailPanel;
