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
    <section className="bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="search"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Buscar proveedor..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
            onClick={onNew}
          >
            <span>➕</span> Nuevo
          </button>
          <button
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={onRefresh}
            title="Actualizar"
          >
            🔄
          </button>
          <div className="h-6 w-px bg-gray-200 mx-1"></div>
          <button
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={onImport}
            title="Importar"
          >
            📥
          </button>
          <button
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={onExport}
            title="Exportar"
          >
            📤
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-gray-500 font-medium">Filtros:</span>

        <select
          className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 text-gray-700"
          value={filters.status}
          onChange={(e) => onFiltersChange({ status: e.target.value as SupplierStatus | 'all' })}
        >
          <option value="all">Todos los estados</option>
          <option value="activo">✅ Activos</option>
          <option value="inactivo">⚫ Inactivos</option>
          <option value="bloqueado">🔒 Bloqueados</option>
          <option value="moroso">🔴 Morosos</option>
        </select>

        <select
          className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 text-gray-700"
          value={filters.cityId}
          onChange={(e) => onFiltersChange({ cityId: e.target.value })}
        >
          <option value="all">Todas las ciudades</option>
          {catalogs.cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>

        <select
          className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 text-gray-700"
          value={filters.categoryId}
          onChange={(e) => onFiltersChange({ categoryId: e.target.value })}
        >
          <option value="all">Todas las categorías</option>
          {catalogs.categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        {(filters.status !== 'all' || filters.cityId !== 'all' || filters.categoryId !== 'all') && (
          <button
            className="text-red-500 hover:text-red-700 text-xs font-medium ml-auto"
            onClick={onClearFilters}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400 flex justify-between">
        <span>{summary}</span>
      </div>
    </section>
  );
};

export default SuppliersToolbar;
