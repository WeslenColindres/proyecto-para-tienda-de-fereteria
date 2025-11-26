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

const CustomerDetailForm = ({ customer, value, onChange, onSave, onCancel, onDelete, isEditing, onToggleEdit }: Props) => {
  const emailValid = /\S+@\S+\.\S+/.test(value.email);
  const nitValid = value.nit.trim().length >= 2;
  const nameValid = value.name.trim().length > 2;
  const canSave = isEditing && emailValid && nitValid && nameValid;

  return (
    <article className="customer-detail">
      <div className="detail-header">
        <div>
          <h3 style={{ margin: 0 }}>Ficha cliente</h3>
          <small style={{ color: 'var(--text-muted)' }}>{customer?.name ?? 'Selecciona un cliente'}</small>
        </div>
        <button className="customer-btn" onClick={onToggleEdit}>
          {isEditing ? 'Cancelar edicion' : '✏️ Editar'}
        </button>
      </div>

      <div className="detail-grid">
        <label>
          NIT
          <input value={value.nit} readOnly={!isEditing} onChange={(e) => onChange({ ...value, nit: e.target.value })} />
          {isEditing && <small style={{ color: nitValid ? 'var(--customer-green)' : 'var(--customer-red)' }}>{nitValid ? 'OK' : 'Formato corto'}</small>}
        </label>
        <label>
          Nombre
          <input value={value.name} readOnly={!isEditing} onChange={(e) => onChange({ ...value, name: e.target.value })} />
          {isEditing && !nameValid && <small style={{ color: 'var(--customer-red)' }}>Ingresa un nombre</small>}
        </label>
        <label>
          Telefono
          <input value={value.phone} readOnly={!isEditing} onChange={(e) => onChange({ ...value, phone: e.target.value })} />
        </label>
        <label>
          Email
          <input value={value.email} readOnly={!isEditing} onChange={(e) => onChange({ ...value, email: e.target.value })} />
          {isEditing && <small style={{ color: emailValid ? 'var(--customer-green)' : 'var(--customer-red)' }}>{emailValid ? 'Email valido' : 'Revisar email'}</small>}
        </label>
        <label>
          Ciudad
          <input value={value.city} readOnly={!isEditing} onChange={(e) => onChange({ ...value, city: e.target.value })} />
        </label>
        <label>
          Tipo
          <select value={value.type} disabled={!isEditing} onChange={(e) => onChange({ ...value, type: e.target.value as any })}>
            <option value="persona-natural">Persona Natural</option>
            <option value="persona-juridica">Persona Juridica</option>
            <option value="extranjero">Extranjero</option>
          </select>
        </label>
        <label>
          Credito
          <div className="row-actions">
            <label className="muted">
              <input type="checkbox" checked={value.hasCredit} disabled={!isEditing} onChange={(e) => onChange({ ...value, hasCredit: e.target.checked })} />
              Tiene credito
            </label>
          </div>
        </label>
        <label>
          Limite credito
          <input
            type="number"
            value={value.creditLimit}
            readOnly={!isEditing}
            onChange={(e) => onChange({ ...value, creditLimit: Number(e.target.value) })}
          />
        </label>
        <label>
          Estado
          <select value={value.status} disabled={!isEditing} onChange={(e) => onChange({ ...value, status: e.target.value as any })}>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="credito">Credito</option>
            <option value="contado">Contado</option>
          </select>
        </label>
        <label>
          Descuento (%)
          <input
            type="number"
            value={value.discount}
            readOnly={!isEditing}
            onChange={(e) => onChange({ ...value, discount: Number(e.target.value) })}
          />
        </label>
      </div>

      <div className="detail-actions">
        <button className="primary" disabled={!canSave} onClick={onSave}>
          💾 Guardar
        </button>
        <button onClick={onCancel} disabled={!isEditing}>
          ❌ Cancelar
        </button>
        <button className="danger" onClick={onDelete}>
          🗑️ Eliminar
        </button>
      </div>
    </article>
  );
};

export default CustomerDetailForm;
