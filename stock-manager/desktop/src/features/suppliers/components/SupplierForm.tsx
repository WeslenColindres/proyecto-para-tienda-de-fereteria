import type { SupplierCatalogs } from '@/shared/types/suppliers';
import type { SupplierFormState } from '../hooks/useSuppliers';

type SupplierFormProps = {
  form: SupplierFormState;
  onChange: (next: Partial<SupplierFormState>) => void;
  catalogs: SupplierCatalogs;
  readOnly?: boolean;
  showValidation?: boolean;
};

const SupplierForm = ({ form, onChange, catalogs, readOnly = false, showValidation = false }: SupplierFormProps) => {
  const nitValid = form.nit.trim().length >= 4;
  const emailValid = /\S+@\S+\.\S+/.test(form.email);
  const nameValid = form.name.trim().length > 2;

  return (
    <div className="detail-grid">
      <label>
        NIT
        <input value={form.nit} onChange={(e) => onChange({ nit: e.target.value })} readOnly={readOnly} />
        {showValidation && (
          <small style={{ color: nitValid ? 'var(--supplier-green)' : 'var(--supplier-red)' }}>
            {nitValid ? 'Formato correcto' : 'Esperando formato valido'}
          </small>
        )}
      </label>
      <label>
        Nombre
        <input value={form.name} onChange={(e) => onChange({ name: e.target.value })} readOnly={readOnly} />
        {showValidation && !nameValid && <small style={{ color: 'var(--supplier-red)' }}>Nombre muy corto</small>}
      </label>
      <label>
        Contacto
        <input value={form.contactName} onChange={(e) => onChange({ contactName: e.target.value })} readOnly={readOnly} />
      </label>
      <label>
        Telefono
        <input value={form.phone} onChange={(e) => onChange({ phone: e.target.value })} readOnly={readOnly} />
      </label>
      <label>
        Email
        <input value={form.email} onChange={(e) => onChange({ email: e.target.value })} readOnly={readOnly} />
        {showValidation && (
          <small style={{ color: emailValid ? 'var(--supplier-green)' : 'var(--supplier-red)' }}>
            {emailValid ? '✓ Email valido' : '✗ Revisar email'}
          </small>
        )}
      </label>
      <label>
        Direccion
        <textarea value={form.address} onChange={(e) => onChange({ address: e.target.value })} readOnly={readOnly} />
      </label>
      <label>
        Ciudad
        <select value={form.cityId} onChange={(e) => onChange({ cityId: e.target.value })} disabled={readOnly}>
          {catalogs.cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Categoria
        <select value={form.categoryId} onChange={(e) => onChange({ categoryId: e.target.value })} disabled={readOnly}>
          {catalogs.categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Dias credito ({form.creditDays})
        <input
          type="range"
          min={0}
          max={90}
          value={form.creditDays}
          onChange={(e) => onChange({ creditDays: Number(e.target.value) })}
          disabled={readOnly}
        />
      </label>
      <label>
        Limite credito
        <input
          value={form.creditLimit}
          onChange={(e) => onChange({ creditLimit: Number(e.target.value) })}
          readOnly={readOnly}
        />
      </label>
      <label>
        Estado
        <select value={form.status} onChange={(e) => onChange({ status: e.target.value as SupplierFormState['status'] })} disabled={readOnly}>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
          <option value="moroso">Moroso</option>
        </select>
      </label>
    </div>
  );
};

export default SupplierForm;
