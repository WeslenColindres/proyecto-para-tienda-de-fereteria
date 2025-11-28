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

  if (!supplier && !isEditing) {
    return (
      <article className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-300 p-8">
        <span className="text-4xl mb-4">👈</span>
        <p className="text-lg font-medium">Selecciona un proveedor para ver detalles</p>
      </article>
    );
  }

  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      <header className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 m-0">
            {isEditing ? 'Editando Proveedor' : 'Ficha de Proveedor'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {supplier?.name ?? 'Nuevo proveedor'}
          </p>
        </div>
        <button
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2
            ${isEditing
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
          onClick={onToggleEditing}
        >
          {isEditing ? 'Cancelar edición' : (
            <>
              <span>✏️</span> Editar
            </>
          )}
        </button>
      </header>

      {!isEditing && (
        <div className="grid grid-cols-3 gap-4 p-6 bg-white border-b border-gray-100">
          {kpis.map((kpi) => (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center" key={kpi.label}>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{kpi.label}</p>
              <p className="text-lg font-bold text-gray-900">{kpi.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6">
        <SupplierForm
          form={form}
          onChange={(next) => onChange({ ...form, ...next })}
          catalogs={catalogs}
          readOnly={!isEditing}
          showValidation={isEditing}
        />
      </div>

      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-wrap gap-3 justify-end">
        {isEditing ? (
          <>
            <button
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              onClick={onReset}
            >
              Restaurar
            </button>
            <button
              className={`px-4 py-2 text-white rounded-lg shadow-sm transition-colors flex items-center gap-2
                ${canSave ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}
              disabled={!canSave}
              onClick={onSave}
            >
              <span>💾</span> Guardar Cambios
            </button>
          </>
        ) : (
          <>
            <button
              className="px-4 py-2 text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 mr-auto"
              onClick={onDelete}
            >
              <span>🗑️</span> Eliminar
            </button>
            <button
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
              onClick={onHistory}
            >
              <span>📊</span> Ver Historial
            </button>
          </>
        )}
      </div>
    </article>
  );
};

export default SupplierDetailPanel;
