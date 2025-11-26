import { useState } from 'react';
import type { CustomerFormState } from '../hooks/useCustomersData';
import type { CustomerItem } from '@/shared/types/customers';

type Props = {
  customer?: CustomerItem | null;
  value: CustomerFormState;
  onChange: (next: CustomerFormState) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  isEditing: boolean;
  onToggleEdit?: () => void;
};

const CustomerDetailForm = ({
  customer,
  value,
  onChange,
  onSave,
  onCancel,
  onDelete,
  isEditing,
  onToggleEdit,
}: Props) => {
  const [activeTab, setActiveTab] = useState<'general' | 'billing'>('general');
  const emailValid = !value.email || /\S+@\S+\.\S+/.test(value.email);
  const nitValid = value.nit.trim().length >= 2;
  const nameValid = value.name.trim().length > 2;
  const canSave = isEditing && emailValid && nitValid && nameValid;

  return (
    <article className="customer-detail">
      <div className="detail-header mb-4">
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
            {isEditing ? (customer ? 'Editar Cliente' : 'Nuevo Cliente') : 'Detalle del Cliente'}
          </h3>
          <p className="text-muted text-sm mt-1">
            {customer?.name ?? 'Complete la informacion del cliente'}
          </p>
        </div>
        {onToggleEdit && (
          <button className="btn-ghost" onClick={onToggleEdit}>
            {isEditing ? 'Cancelar' : '✏️ Editar'}
          </button>
        )}
      </div>

      <div className="tab-group">
        <button
          className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button
          className={`tab-btn ${activeTab === 'billing' ? 'active' : ''}`}
          onClick={() => setActiveTab('billing')}
        >
          Facturacion y Credito
        </button>
      </div>

      <div className="detail-content">
        {activeTab === 'general' && (
          <div className="animate-fade-in detail-grid">
            <div className="field full">
              <label>Nombre Completo *</label>
              <input
                value={value.name}
                readOnly={!isEditing}
                placeholder="Ej: Juan Perez / Empresa S.A."
                onChange={(e) => onChange({ ...value, name: e.target.value })}
                className={!nameValid && isEditing ? 'border-red-500' : ''}
              />
            </div>

            <div className="field">
              <label>NIT / DPI *</label>
              <input
                value={value.nit}
                readOnly={!isEditing}
                placeholder="CF o Numero"
                onChange={(e) => onChange({ ...value, nit: e.target.value })}
              />
            </div>

            <div className="field">
              <label>Tipo de Cliente</label>
              <select
                value={value.type}
                disabled={!isEditing}
                onChange={(e) => onChange({ ...value, type: e.target.value as any })}
              >
                <option value="persona-natural">Persona Natural</option>
                <option value="persona-juridica">Persona Juridica</option>
                <option value="extranjero">Extranjero</option>
              </select>
            </div>

            <div className="field">
              <label>Telefono</label>
              <div className="input-group">
                <span className="prefix">📞</span>
                <input
                  value={value.phone}
                  readOnly={!isEditing}
                  placeholder="####-####"
                  onChange={(e) => onChange({ ...value, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="field">
              <label>Email</label>
              <div className="input-group">
                <span className="prefix">@</span>
                <input
                  value={value.email}
                  readOnly={!isEditing}
                  placeholder="cliente@ejemplo.com"
                  onChange={(e) => onChange({ ...value, email: e.target.value })}
                />
              </div>
              {isEditing && !emailValid && (
                <span className="text-xs text-red-500 mt-1">Email invalido</span>
              )}
            </div>

            <div className="field full">
              <label>Direccion / Ciudad</label>
              <input
                value={value.city}
                readOnly={!isEditing}
                placeholder="Ciudad o Municipio"
                onChange={(e) => onChange({ ...value, city: e.target.value })}
              />
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="animate-fade-in detail-grid">
            <div className="field full">
              <p className="section-title">Configuracion de Credito</p>
              <label className="flex items-center gap-2 cursor-pointer p-2 border rounded hover:bg-white/5">
                <input
                  type="checkbox"
                  checked={value.hasCredit}
                  disabled={!isEditing}
                  onChange={(e) => onChange({ ...value, hasCredit: e.target.checked })}
                />
                <span className="font-medium">Habilitar Credito</span>
              </label>
            </div>

            {value.hasCredit && (
              <>
                <div className="field">
                  <label>Limite de Credito</label>
                  <div className="input-group">
                    <span className="prefix">Q</span>
                    <input
                      type="number"
                      value={value.creditLimit}
                      readOnly={!isEditing}
                      onChange={(e) => onChange({ ...value, creditLimit: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Dias de Credito</label>
                  <input
                    type="number"
                    placeholder="30"
                    readOnly={!isEditing}
                    // Assuming we might add creditDays to state later, for now just a placeholder UI
                    disabled={!isEditing}
                  />
                </div>
              </>
            )}

            <div className="field full mt-4">
              <p className="section-title">Comercial</p>
            </div>

            <div className="field">
              <label>Descuento Fijo (%)</label>
              <div className="input-group">
                <span className="prefix">%</span>
                <input
                  type="number"
                  value={value.discount}
                  readOnly={!isEditing}
                  onChange={(e) => onChange({ ...value, discount: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="field">
              <label>Estado</label>
              <select
                value={value.status}
                disabled={!isEditing}
                onChange={(e) => onChange({ ...value, status: e.target.value as any })}
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="credito">Solo Credito</option>
                <option value="contado">Solo Contado</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="form-actions">
        <button className="btn-primary" disabled={!canSave} onClick={onSave}>
          {isEditing ? 'Guardar Cambios' : 'Crear Cliente'}
        </button>
        {isEditing && (
          <button className="btn-ghost" onClick={onCancel}>
            Cancelar
          </button>
        )}
        {isEditing && customer && (
          <button className="btn-danger-ghost" onClick={onDelete}>
            Eliminar
          </button>
        )}
      </div>
    </article>
  );
};

export default CustomerDetailForm;
