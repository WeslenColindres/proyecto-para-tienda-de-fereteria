import { useEffect, useMemo, useState } from 'react';
import { productsApi } from '@/shared/api/products';
import { suppliersApi } from '@/shared/api/suppliers';
import { ApiError } from '@/shared/api/types';
import { PRODUCT_MOVEMENTS } from '@/shared/data/products';
import { useCategories } from '@/shared/hooks/useCategories';
import { useIsDesktop } from '@/shared/hooks/useIsDesktop';
import { useProductCatalog, type ProductFormState } from '@/shared/hooks/useProductCatalog';
import { formatCurrency } from '@/shared/utils/format';
import type {
  ImportSummary,
  InventoryMovement,
  ProductItem,
  ProductStatus,
} from '@/shared/types/products';
import Modal from '@/ui/molecules/Modal/Modal';
import { Drawer } from '@/ui/molecules/Drawer/Drawer';
import { ProductImportModal } from '../components/ProductImportModal';
import { LucideSearch, LucidePlus, LucideFilter, LucideDownload, LucideEdit, LucideTrash2, LucideRefreshCw, LucideAlertTriangle, LucideCheckCircle, LucideXCircle } from 'lucide-react';

const SortableHeader = ({ label, field, currentSort, currentDir, onSort }: any) => (
  <th
    onClick={() => onSort(field)}
    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors ${currentSort === field ? 'bg-gray-50 text-blue-600' : ''}`}
  >
    <div className="flex items-center gap-2">
      {label}
      {currentSort === field && (
        <span>{currentDir === 'ASC' ? '↑' : '↓'}</span>
      )}
    </div>
  </th>
);

const stockState = (product: ProductItem): 'ok' | 'low' | 'critical' | 'preventive' => {
  if (product.stock === 0 || product.stock < product.minStock * 0.5) return 'critical';
  if (product.stock < product.minStock) return 'low';
  if (product.stock < product.minStock * 1.5) return 'preventive';
  return 'ok';
};

const ProductsCatalogPage = () => {
  const isDesktop = useIsDesktop();
  const { categories } = useCategories();
  const {
    filters,
    setFilters,
    meta,
    products,
    loading,
    selectedId,
    selectProduct,
    createNew,
    formState,
    setFormState,
    mode,
    saveProduct,
    deleteProduct,
    setPage,
    reload,
  } = useProductCatalog();

  const [movements, setMovements] = useState<InventoryMovement[]>(PRODUCT_MOVEMENTS);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [downloading, setDownloading] = useState<'template-xlsx' | 'template-csv' | 'data' | null>(null);
  const [editorTab, setEditorTab] = useState<'basic' | 'advanced' | 'suppliers'>('basic');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [productSuppliers, setProductSuppliers] = useState<any[]>([]);
  const [availableSuppliers, setAvailableSuppliers] = useState<any[]>([]);
  const [newSupplierId, setNewSupplierId] = useState('');
  const [newSupplierCost, setNewSupplierCost] = useState('');
  const [newSupplierCode, setNewSupplierCode] = useState('');
  const [newSupplierIsMain, setNewSupplierIsMain] = useState(false);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedId),
    [products, selectedId],
  );

  useEffect(() => {
    if (!selectedId) return;
    const loadMovements = async () => {
      setMovementsLoading(true);
      try {
        const response = await productsApi.movements(selectedId, { limit: 6 });
        setMovements(response.data ?? []);
      } catch (err) {
        setMovements(PRODUCT_MOVEMENTS);
      } finally {
        setMovementsLoading(false);
      }
    };
    loadMovements().catch(() => undefined);

    const loadProductSuppliers = async () => {
      if (selectedId) {
        const suppliers = await productsApi.getSuppliers(selectedId);
        setProductSuppliers(suppliers);
      }
    };
    loadProductSuppliers();
  }, [selectedId]);

  useEffect(() => {
    const loadAvailableSuppliers = async () => {
      try {
        const response = await suppliersApi.list({ page: 1, pageSize: 100, status: 'activo' });
        setAvailableSuppliers(response.data);
      } catch (err) {
        console.error('Error loading suppliers', err);
      }
    };
    loadAvailableSuppliers();
  }, []);

  const handleCreate = () => {
    createNew();
    setIsDrawerOpen(true);
    setEditorTab('basic');
  };

  const handleEdit = (id: string) => {
    selectProduct(id);
    setIsDrawerOpen(true);
    setEditorTab('basic');
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    selectProduct(null);
  };

  const handleAddSupplier = async () => {
    if (!selectedId || !newSupplierId || !newSupplierCost) return;
    try {
      await productsApi.addSupplier(selectedId, {
        supplierId: newSupplierId,
        cost: parseFloat(newSupplierCost),
        code: newSupplierCode,
        isMain: newSupplierIsMain
      });
      const suppliers = await productsApi.getSuppliers(selectedId);
      setProductSuppliers(suppliers);
      setNewSupplierId('');
      setNewSupplierCost('');
      setNewSupplierCode('');
      setNewSupplierIsMain(false);
    } catch (err) {
      alert('Error al agregar proveedor');
    }
  };

  const handleRemoveSupplier = async (supplierId: string) => {
    if (!selectedId) return;
    if (!confirm('¿Estás seguro de eliminar este proveedor?')) return;
    try {
      await productsApi.removeSupplier(selectedId, supplierId);
      const suppliers = await productsApi.getSuppliers(selectedId);
      setProductSuppliers(suppliers);
    } catch (err) {
      alert('Error al eliminar proveedor');
    }
  };

  const handleUpdateSupplierPrice = async (supplierId: string, price: string) => {
    if (!selectedId) return;
    try {
      await productsApi.updateSupplierPrice(selectedId, supplierId, parseFloat(price));
    } catch (err) {
      console.error('Error updating price', err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveProduct();
      setIsDrawerOpen(false);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo guardar el producto';
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProduct();
      setShowDelete(false);
      setIsDrawerOpen(false);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo eliminar';
      alert(message);
    }
  };

  const handleDownload = async (target: 'template-xlsx' | 'template-csv' | 'data') => {
    setDownloading(target);
    try {
      let blob: Blob;
      let filename = 'productos_actuales.csv';

      if (target === 'data') {
        blob = await productsApi.exportData(filters);
      } else if (target === 'template-csv') {
        blob = await productsApi.exportTemplate('csv');
        filename = 'plantilla_productos.csv';
      } else {
        blob = await productsApi.exportTemplate('xlsx');
        filename = 'plantilla_productos.xlsx';
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'No se pudo generar el archivo solicitado';
      alert(message);
    } finally {
      setDownloading(null);
    }
  };

  const handleSort = (field: string) => {
    const isAsc = filters.orderBy === field && filters.orderDir === 'ASC';
    setFilters(prev => ({
      ...prev,
      orderBy: field,
      orderDir: isAsc ? 'DESC' : 'ASC',
      page: 1
    }));
  };

  return (
    <main className="flex flex-col h-full bg-gray-50 overflow-hidden">
      {/* Toolbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
              placeholder="Buscar por código, nombre o barras..."
              value={filters.search ?? ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
            />
          </div>
          <button
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Refrescar"
            onClick={() => setFilters((prev) => ({ ...prev, search: '', page: 1 }))}
          >
            <LucideRefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
            onClick={() => setShowBulkModal(true)}
          >
            <LucideDownload className="w-4 h-4" />
            Importar / Exportar
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm transition-colors"
            onClick={handleCreate}
          >
            <LucidePlus className="w-4 h-4" />
            Nuevo Producto
          </button>
        </div>
      </header>

      {/* Filters Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex flex-wrap gap-4 items-center text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <LucideFilter className="w-4 h-4" />
          <span className="font-medium">Filtros:</span>
        </div>

        <select
          className="bg-gray-50 border border-gray-300 text-gray-700 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
          value={filters.categoryId}
          onChange={(e) => setFilters((prev) => ({ ...prev, categoryId: e.target.value, page: 1 }))}
        >
          <option value="all">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <select
          className="bg-gray-50 border border-gray-300 text-gray-700 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
          value={filters.stockState}
          onChange={(e) => setFilters((prev) => ({ ...prev, stockState: e.target.value as any, page: 1 }))}
        >
          <option value="all">Todo el stock</option>
          <option value="with-stock">Con stock</option>
          <option value="low">Stock bajo</option>
          <option value="preventive">Preventivo</option>
          <option value="no-stock">Sin stock</option>
        </select>

        <select
          className="bg-gray-50 border border-gray-300 text-gray-700 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value as ProductStatus | 'all', page: 1 }))}
        >
          <option value="all">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
          <option value="descontinuado">Descontinuado</option>
        </select>

        <div className="ml-auto text-gray-500">
          Mostrando <strong>{products.length}</strong> de <strong>{meta.total}</strong> resultados
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </th>
                  <SortableHeader label="Código" field="sku" currentSort={filters.orderBy} currentDir={filters.orderDir} onSort={handleSort} />
                  <SortableHeader label="Nombre" field="nombre" currentSort={filters.orderBy} currentDir={filters.orderDir} onSort={handleSort} />
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                  <SortableHeader label="Stock" field="stock" currentSort={filters.orderBy} currentDir={filters.orderDir} onSort={handleSort} />
                  <SortableHeader label="Precio" field="precio" currentSort={filters.orderBy} currentDir={filters.orderDir} onSort={handleSort} />
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 w-4 bg-gray-200 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-48 bg-gray-200 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-20 bg-gray-200 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-6 w-16 bg-gray-200 rounded-full"></div></td>
                      <td className="px-6 py-4"><div className="h-8 w-8 bg-gray-200 rounded ml-auto"></div></td>
                    </tr>
                  ))
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-3">
                        <LucideSearch className="w-12 h-12 text-gray-300" />
                        <p className="text-lg font-medium">No se encontraron productos</p>
                        <p className="text-sm">Intenta ajustar los filtros o crea un nuevo producto.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const state = stockState(product);
                    const statusColors = {
                      activo: 'bg-green-100 text-green-800',
                      inactivo: 'bg-gray-100 text-gray-800',
                      descontinuado: 'bg-red-100 text-red-800',
                    };
                    const stockColors = {
                      ok: 'bg-green-500',
                      low: 'bg-yellow-500',
                      critical: 'bg-red-500',
                      preventive: 'bg-blue-500',
                    };

                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer group"
                        onClick={() => handleEdit(product.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={product.id === selectedId}
                            readOnly
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.code}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <div className="font-medium">{product.name}</div>
                          {product.barcode && <div className="text-xs text-gray-400">{product.barcode}</div>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.categoryName || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${stockColors[state]}`} title={`Estado: ${state}`}></span>
                            {product.stock} {product.unit}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(product.price)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[product.status]}`}>
                            {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            className="text-gray-400 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50 transition-colors opacity-0 group-hover:opacity-100"
                            onClick={(e) => { e.stopPropagation(); handleEdit(product.id); }}
                            title="Editar"
                          >
                            <LucideEdit className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Página {meta.page} de {Math.max(1, Math.ceil(meta.total / meta.pageSize))}
            </div>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={meta.page <= 1}
                onClick={() => setPage(Math.max(1, meta.page - 1))}
              >
                Anterior
              </button>
              <button
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={meta.page * meta.pageSize >= meta.total}
                onClick={() => setPage(meta.page + 1)}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>

      <Drawer
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={mode === 'create' ? 'Nuevo Producto' : 'Editar Producto'}
        width="max-w-2xl"
      >
        <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${editorTab === 'basic' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setEditorTab('basic')}
          >
            Básico
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${editorTab === 'advanced' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setEditorTab('advanced')}
          >
            Avanzado
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${editorTab === 'suppliers' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setEditorTab('suppliers')}
          >
            Proveedores
          </button>
        </div>

        {editorTab === 'basic' && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del producto <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                maxLength={100}
                placeholder="Ej: Martillo de uña 16oz"
                value={formState.name}
                onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio Venta <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Q</span>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="0.00"
                    value={formState.price}
                    onChange={(e) => setFormState((prev) => ({ ...prev, price: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Costo (Opcional)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Q</span>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="0.00"
                    value={formState.cost}
                    onChange={(e) => setFormState((prev) => ({ ...prev, cost: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={formState.categoryId}
                  onChange={(e) => setFormState((prev) => ({ ...prev, categoryId: e.target.value }))}
                >
                  <option value="">Seleccionar...</option>
                  {categories.map((cat) => (
                    <option value={cat.id} key={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={formState.unit}
                  onChange={(e) => setFormState((prev) => ({ ...prev, unit: e.target.value }))}
                >
                  <option value="unidad">Unidad</option>
                  <option value="kg">Kilogramo</option>
                  <option value="litro">Litro</option>
                  <option value="caja">Caja</option>
                  <option value="paquete">Paquete</option>
                </select>
              </div>
            </div>

            {mode === 'create' && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <label className="block text-sm font-medium text-blue-900 mb-1">Stock Inicial</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  placeholder="0"
                  value={formState.initialStock}
                  onChange={(e) => setFormState((prev) => ({ ...prev, initialStock: e.target.value }))}
                />
                <p className="text-xs text-blue-700 mt-2 flex items-center gap-1">
                  <LucideCheckCircle className="w-3 h-3" />
                  Se creará un movimiento de entrada automático.
                </p>
              </div>
            )}
          </div>
        )}

        {editorTab === 'advanced' && (
          <div className="space-y-5 animate-fade-in">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Autogenerado"
                  value={formState.code}
                  onChange={(e) => setFormState((prev) => ({ ...prev, code: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código de Barras</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Escanear..."
                  value={formState.barcode}
                  onChange={(e) => setFormState((prev) => ({ ...prev, barcode: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="Detalles adicionales..."
                value={formState.description}
                onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Impuesto</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formState.tax}
                  onChange={(e) => setFormState((prev) => ({ ...prev, tax: e.target.value }))}
                >
                  <option value="0">Exento (0%)</option>
                  <option value="12">IVA (12%)</option>
                  <option value="15">15%</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0"
                  value={formState.minStock}
                  onChange={(e) => setFormState((prev) => ({ ...prev, minStock: e.target.value }))}
                />
              </div>
            </div>

            <div className="pt-5 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">Estado</label>
              <div className="flex gap-4">
                {(['activo', 'inactivo', 'descontinuado'] as ProductStatus[]).map((status) => (
                  <label key={status} className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border transition-all ${formState.status === status ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input
                      type="radio"
                      name="product-status"
                      className="text-blue-600 focus:ring-blue-500"
                      checked={formState.status === status}
                      onChange={() => setFormState((prev) => ({ ...prev, status }))}
                    />
                    <span className="capitalize text-sm font-medium text-gray-700">{status}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {editorTab === 'suppliers' && (
          <div className="animate-fade-in space-y-6">
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <h4 className="font-medium mb-4 text-sm text-gray-900 flex items-center gap-2">
                <LucidePlus className="w-4 h-4 text-blue-600" />
                Agregar Proveedor
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Proveedor</label>
                  <select
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newSupplierId}
                    onChange={(e) => setNewSupplierId(e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    {availableSuppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Costo (Q)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="0.00"
                    value={newSupplierCost}
                    onChange={(e) => setNewSupplierCost(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Código Producto (Opcional)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Ej. PROD-001"
                    value={newSupplierCode}
                    onChange={(e) => setNewSupplierCode(e.target.value)}
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="rounded text-blue-600 focus:ring-blue-500"
                      checked={newSupplierIsMain}
                      onChange={(e) => setNewSupplierIsMain(e.target.checked)}
                    />
                    <span className="text-sm text-gray-700">Proveedor Principal</span>
                  </label>
                </div>
              </div>
              <button
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                onClick={handleAddSupplier}
                disabled={!newSupplierId || !newSupplierCost}
              >
                Agregar Proveedor
              </button>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Proveedor</th>
                    <th className="px-4 py-3 text-left font-medium">Código</th>
                    <th className="px-4 py-3 text-right font-medium">Costo</th>
                    <th className="px-4 py-3 text-center font-medium">Principal</th>
                    <th className="px-4 py-3 text-center font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {productSuppliers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500 italic">
                        No hay proveedores asignados a este producto
                      </td>
                    </tr>
                  ) : (
                    productSuppliers.map((ps) => (
                      <tr key={ps.id_proveedor} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900">{ps.nombre_proveedor || 'Proveedor ' + ps.id_proveedor}</td>
                        <td className="px-4 py-3 text-gray-500">{ps.codigo_producto_proveedor || '-'}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-gray-400 text-xs">Q</span>
                            <input
                              type="number"
                              step="0.01"
                              className="w-20 p-1 text-right border border-transparent hover:border-gray-300 rounded focus:border-blue-500 outline-none bg-transparent"
                              defaultValue={ps.precio_costo}
                              onBlur={(e) => handleUpdateSupplierPrice(ps.id_proveedor, e.target.value)}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {ps.es_proveedor_principal ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Principal
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"
                            onClick={() => handleRemoveSupplier(ps.id_proveedor)}
                            title="Eliminar"
                          >
                            <LucideTrash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
          {mode === 'edit' ? (
            <button
              className="text-red-600 hover:text-red-700 text-sm font-medium hover:underline"
              onClick={() => setShowDelete(true)}
            >
              Eliminar producto
            </button>
          ) : <div></div>}

          <div className="flex gap-3">
            <button
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
              onClick={handleCloseDrawer}
            >
              Cancelar
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? 'Guardando...' : mode === 'create' ? 'Crear Producto' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </Drawer>

      <Modal
        open={showBulkModal}
        title="Importar / Exportar productos"
        description="Gestiona tu inventario masivamente."
        onClose={() => setShowBulkModal(false)}
        footer={null}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
            <h4 className="font-medium text-gray-900 mb-2">Exportar</h4>
            <p className="text-sm text-gray-500 mb-4">Descarga tu inventario actual o plantillas vacías.</p>
            <div className="space-y-2">
              <button
                className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-all text-sm font-medium text-gray-700"
                onClick={() => handleDownload('template-xlsx')}
                disabled={downloading === 'template-xlsx'}
              >
                <span>Plantilla Excel (Recomendado)</span>
                <LucideDownload className="w-4 h-4" />
              </button>
              <button
                className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-all text-sm font-medium text-gray-700"
                onClick={() => handleDownload('data')}
                disabled={downloading === 'data'}
              >
                <span>Exportar Inventario Actual</span>
                <LucideDownload className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-blue-100 bg-blue-50">
            <h4 className="font-medium text-blue-900 mb-2">Importar</h4>
            <p className="text-sm text-blue-700 mb-4">Carga masiva de productos desde Excel o CSV.</p>
            <button
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm transition-colors"
              onClick={() => {
                setShowBulkModal(false);
                setShowImportModal(true);
              }}
            >
              Abrir Asistente de Importación
            </button>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button type="button" className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium text-sm" onClick={() => setShowBulkModal(false)}>
            Cerrar
          </button>
        </div>
      </Modal>

      <Modal
        open={showDelete}
        title="Eliminar producto"
        description="¿Estás seguro que deseas eliminar este producto?"
        onClose={() => setShowDelete(false)}
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
              onClick={() => setShowDelete(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium shadow-sm"
              onClick={handleDelete}
            >
              Sí, eliminar
            </button>
          </div>
        }
      >
        <div className="p-4 bg-red-50 rounded-lg border border-red-100 flex gap-3">
          <LucideAlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-800">
            El producto se marcará como <strong>Descontinuado</strong> para mantener el historial de movimientos, pero ya no aparecerá en las búsquedas activas.
          </p>
        </div>
      </Modal>

      {showImportModal && (
        <ProductImportModal
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            reload();
            setShowImportModal(false);
          }}
        />
      )}
    </main>
  );
};

export default ProductsCatalogPage;
