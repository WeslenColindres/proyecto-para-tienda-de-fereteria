import type { SupplierCatalogs, SupplierStatus } from '@/shared/types/suppliers';
import type { SupplierFilters } from '../hooks/useSuppliers';

type SuppliersToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  filters: SupplierFilters;
  catalogs: SupplierCatalogs;
  onFiltersChange: (next: Partial<SupplierFilters>) => void;
  onNew: () => void;
  onExport: () => void;
  onImport: () => void;
  onRefresh: () => void;
  onClearFilters: () => void;
  summary: string;
};

const SuppliersToolbar = ({
  search,
  onSearchChange,
  filters,
  catalogs,
  onFiltersChange,
  onNew,
  onExport,
  onImport,
  onRefresh,
  onClearFilters,
  summary,
}: SuppliersToolbarProps) => {
  return (
    <section className="suppliers-toolbar">
      <div className="suppliers-actions justify-center ">
        <button className="supplier-btn new" onClick={onNew}>
          ➕ Nuevo Proveedor
        </button>
        <button className="supplier-btn import" onClick={onImport}>
          📥 Importar
        </button>
        <button className="supplier-btn export" onClick={onExport}>
          📤 Exportar
        </button>
        <button className="supplier-btn refresh" onClick={onRefresh}>
          🔄 Actualizar
        </button>
      </div>
      <div className="suppliers-search">
        <div className="search-box">
          <span>🔍</span>
          <input
            type="search"
            placeholder="NIT, nombre, código, contacto..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <select value={filters.status} onChange={(e) => onFiltersChange({ status: e.target.value as SupplierStatus | 'all' })}>
          <option value="all">Estado</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
          <option value="moroso">Morosos</option>
        </select>
        <select value={filters.cityId} onChange={(e) => onFiltersChange({ cityId: e.target.value })}>
          <option value="all">Ciudad</option>
          {catalogs.cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
        <select value={filters.categoryId} onChange={(e) => onFiltersChange({ categoryId: e.target.value })}>
          <option value="all">Categoria</option>
          {catalogs.categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <button className="supplier-btn ghost" onClick={onClearFilters}>
          Limpiar filtros
        </button>
      </div>
      <p className="muted text-center" style={{ marginTop: 6 }}>
        {summary || 'Mostrando todo el catalogo'}
      </p>
    </section>
  );
};

export default SuppliersToolbar;
