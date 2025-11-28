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
    <div className="supplier-form-container fade-in space-y-6">
      {/* Section: General Info */}
      <div className="bg-panel p-4 rounded-lg border border-subtle">
        <h3 className="text-sm font-semibold text-muted mb-3 uppercase tracking-wider">Información General</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="nit" className="block text-sm font-medium text-secondary mb-1">NIT <span className="text-red-500">*</span></label>
            <input
              id="nit"
              value={form.nit}
              onChange={(e) => onChange({ nit: e.target.value })}
              onBlur={() => handleBlur('nit')}
              readOnly={readOnly}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-panel-strong text-primary ${showNitError ? 'border-red-500' : 'border-subtle'}`}
              placeholder="Ej. 123456-7"
              tabIndex={1}
            />
            {showNitError && <div className="text-xs text-red-500 mt-1">Mínimo 4 caracteres.</div>}
          </div>

          <div className="form-group">
            <label htmlFor="name" className="block text-sm font-medium text-secondary mb-1">Nombre Comercial <span className="text-red-500">*</span></label>
            <input
              id="name"
              value={form.name}
              onChange={(e) => onChange({ name: e.target.value })}
              onBlur={() => handleBlur('name')}
              readOnly={readOnly}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-panel-strong text-primary ${showNameError ? 'border-red-500' : 'border-subtle'}`}
              placeholder="Ej. Ferretería Central"
              tabIndex={2}
            />
            {showNameError && <div className="text-xs text-red-500 mt-1">Nombre muy corto.</div>}
          </div>

          <div className="form-group">
            <label htmlFor="contactName" className="block text-sm font-medium text-secondary mb-1">Contacto</label>
            <input
              id="contactName"
              value={form.contactName}
              onChange={(e) => onChange({ contactName: e.target.value })}
              readOnly={readOnly}
              className="w-full px-3 py-2 border border-subtle rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-panel-strong text-primary"
              placeholder="Nombre del vendedor"
              tabIndex={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="block text-sm font-medium text-secondary mb-1">Teléfono</label>
            <input
              id="phone"
              value={form.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              onBlur={() => handleBlur('phone')}
              readOnly={readOnly}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-panel-strong text-primary ${showPhoneError ? 'border-red-500' : 'border-subtle'}`}
              placeholder="Ej. 5555-5555"
              tabIndex={4}
            />
            {showPhoneError && <div className="text-xs text-red-500 mt-1">Mínimo 8 dígitos.</div>}
          </div>

          <div className="form-group md:col-span-2">
            <label htmlFor="email" className="block text-sm font-medium text-secondary mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => onChange({ email: e.target.value })}
              onBlur={() => handleBlur('email')}
              readOnly={readOnly}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-panel-strong text-primary ${showEmailError ? 'border-red-500' : 'border-subtle'}`}
              placeholder="contacto@proveedor.com"
              tabIndex={5}
            />
            {showEmailError && <div className="text-xs text-red-500 mt-1">Email inválido.</div>}
          </div>
        </div>
      </div>

      {/* Section: Location */}
      <div className="bg-panel p-4 rounded-lg border border-subtle">
        <h3 className="text-sm font-semibold text-muted mb-3 uppercase tracking-wider">Ubicación</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-secondary mb-1">Dirección</label>
            <textarea
              id="address"
              value={form.address}
              onChange={(e) => onChange({ address: e.target.value })}
              readOnly={readOnly}
              rows={2}
              className="w-full px-3 py-2 border border-subtle rounded-md focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-panel-strong text-primary"
              placeholder="Dirección completa"
              tabIndex={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="cityId" className="block text-sm font-medium text-secondary mb-1">Ciudad</label>
            <select
              id="cityId"
              value={form.cityId}
              onChange={(e) => onChange({ cityId: e.target.value })}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-subtle rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-panel-strong text-primary"
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
            <label htmlFor="categoryId" className="block text-sm font-medium text-secondary mb-1">Categoría</label>
            <select
              id="categoryId"
              value={form.categoryId}
              onChange={(e) => onChange({ categoryId: e.target.value })}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-subtle rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-panel-strong text-primary"
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
      </div>

      {/* Section: Financial */}
      <div className="bg-panel p-4 rounded-lg border border-subtle">
        <h3 className="text-sm font-semibold text-muted mb-3 uppercase tracking-wider">Información Financiera</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="creditDays" className="block text-sm font-medium text-secondary mb-1">
              Días Crédito: <span className="font-bold text-primary">{form.creditDays}</span>
            </label>
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
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-muted mt-1">
              <span>0</span><span>30</span><span>60</span><span>90</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="creditLimit" className="block text-sm font-medium text-secondary mb-1">Límite Crédito</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">Q</span>
              <input
                id="creditLimit"
                type="number"
                value={form.creditLimit}
                onChange={(e) => onChange({ creditLimit: Number(e.target.value) })}
                readOnly={readOnly}
                className="w-full pl-8 pr-3 py-2 border border-subtle rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-panel-strong text-primary"
                tabIndex={10}
              />
            </div>
          </div>

          <div className="form-group md:col-span-2">
            <label htmlFor="paymentConditions" className="block text-sm font-medium text-secondary mb-1">Condiciones de Pago</label>
            <textarea
              id="paymentConditions"
              value={form.paymentConditions}
              onChange={(e) => onChange({ paymentConditions: e.target.value })}
              readOnly={readOnly}
              rows={2}
              className="w-full px-3 py-2 border border-subtle rounded-md focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-panel-strong text-primary"
              placeholder="Ej. Pago contra entrega, transferencia bancaria..."
              tabIndex={12}
            />
          </div>

          <div className="form-group md:col-span-2">
            <label htmlFor="status" className="block text-sm font-medium text-secondary mb-1">Estado</label>
            <select
              id="status"
              value={form.status}
              onChange={(e) => onChange({ status: e.target.value as SupplierFormState['status'] })}
              disabled={readOnly}
              tabIndex={13}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none font-medium bg-panel-strong
                ${form.status === 'activo' ? 'text-green-600 border-green-200' :
                  form.status === 'inactivo' ? 'text-gray-500 border-gray-200' :
                    form.status === 'bloqueado' ? 'text-red-600 border-red-200' :
                      'text-orange-600 border-orange-200'}`}
            >
              <option value="activo">✅ Activo</option>
              <option value="inactivo">⚫ Inactivo</option>
              <option value="bloqueado">🔒 Bloqueado</option>
              <option value="moroso">🔴 Moroso</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierForm;
