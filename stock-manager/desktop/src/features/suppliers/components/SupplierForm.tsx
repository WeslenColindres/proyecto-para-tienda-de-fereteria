import { useEffect, useState } from 'react';
import type { SupplierCatalogs } from '@/shared/types/suppliers';
import type { SupplierFormState } from '../hooks/useSuppliers';
import './SupplierForm.css'; // We will create this file next

type SupplierFormProps = {
  form: SupplierFormState;
  onChange: (next: Partial<SupplierFormState>) => void;
  catalogs: SupplierCatalogs;
  readOnly?: boolean;
  showValidation?: boolean;
};

const SupplierForm = ({ form, onChange, catalogs, readOnly = false, showValidation = false }: SupplierFormProps) => {
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const nitValid = form.nit.trim().length >= 4;
  const emailValid = !form.email || /\S+@\S+\.\S+/.test(form.email);
  const nameValid = form.name.trim().length > 2;
  const phoneValid = form.phone.trim().length >= 8;

  const showNitError = (showValidation || touched.nit) && !nitValid;
  const showEmailError = (showValidation || touched.email) && !emailValid;
  const showNameError = (showValidation || touched.name) && !nameValid;
  const showPhoneError = (showValidation || touched.phone) && !phoneValid;

  return (
    <div className="supplier-form-container fade-in">
      <div className="form-group">
        <label htmlFor="nit">NIT <span className="required">*</span></label>
        <input
          id="nit"
          value={form.nit}
          onChange={(e) => onChange({ nit: e.target.value })}
          onBlur={() => handleBlur('nit')}
          readOnly={readOnly}
          className={showNitError ? 'input-error' : ''}
          placeholder="Ej. 123456-7"
          tabIndex={1}
        />
        <div className={`error-message ${showNitError ? 'visible' : ''}`}>
          El NIT debe tener al menos 4 caracteres.
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="name">Nombre Comercial <span className="required">*</span></label>
        <input
          id="name"
          value={form.name}
          onChange={(e) => onChange({ name: e.target.value })}
          onBlur={() => handleBlur('name')}
          readOnly={readOnly}
          className={showNameError ? 'input-error' : ''}
          placeholder="Ej. Ferretería Central"
          tabIndex={2}
        />
        <div className={`error-message ${showNameError ? 'visible' : ''}`}>
          El nombre es muy corto.
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="contactName">Contacto</label>
          <input
            id="contactName"
            value={form.contactName}
            onChange={(e) => onChange({ contactName: e.target.value })}
            readOnly={readOnly}
            placeholder="Nombre del vendedor"
            tabIndex={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Teléfono</label>
          <input
            id="phone"
            value={form.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            onBlur={() => handleBlur('phone')}
            readOnly={readOnly}
            className={showPhoneError ? 'input-error' : ''}
            placeholder="Ej. 5555-5555"
            tabIndex={4}
          />
          <div className={`error-message ${showPhoneError ? 'visible' : ''}`}>
            Teléfono inválido (min 8 dígitos).
          </div>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => onChange({ email: e.target.value })}
          onBlur={() => handleBlur('email')}
          readOnly={readOnly}
          className={showEmailError ? 'input-error' : ''}
          placeholder="contacto@proveedor.com"
          tabIndex={5}
        />
        <div className={`error-message ${showEmailError ? 'visible' : ''}`}>
          Formato de correo inválido.
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="address">Dirección</label>
        <textarea
          id="address"
          value={form.address}
          onChange={(e) => onChange({ address: e.target.value })}
          readOnly={readOnly}
          rows={2}
          placeholder="Dirección completa"
          tabIndex={6}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="cityId">Ciudad</label>
          <select
            id="cityId"
            value={form.cityId}
            onChange={(e) => onChange({ cityId: e.target.value })}
            disabled={readOnly}
            tabIndex={7}
          >
            {catalogs.cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="categoryId">Categoría</label>
          <select
            id="categoryId"
            value={form.categoryId}
            onChange={(e) => onChange({ categoryId: e.target.value })}
            disabled={readOnly}
            tabIndex={8}
          >
            {catalogs.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="creditDays">Días Crédito: <strong>{form.creditDays}</strong></label>
          <input
            id="creditDays"
            type="range"
            min={0}
            max={90}
            step={15}
            value={form.creditDays}
            onChange={(e) => onChange({ creditDays: Number(e.target.value) })}
            disabled={readOnly}
            tabIndex={9}
            className="range-input"
          />
          <div className="range-markers">
            <span>0</span><span>30</span><span>60</span><span>90</span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="creditLimit">Límite Crédito</label>
          <div className="input-prefix">
            <span>Q</span>
            <input
              id="creditLimit"
              type="number"
              value={form.creditLimit}
              onChange={(e) => onChange({ creditLimit: Number(e.target.value) })}
              readOnly={readOnly}
              tabIndex={10}
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="status">Estado</label>
        <select
          id="status"
          value={form.status}
          onChange={(e) => onChange({ status: e.target.value as SupplierFormState['status'] })}
          disabled={readOnly}
          tabIndex={11}
          className={`status-select ${form.status}`}
        >
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
          <option value="moroso">Moroso</option>
        </select>
      </div>
    </div>
  );
};

export default SupplierForm;
