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

const stockState = (product: ProductItem): 'ok' | 'low' | 'critical' | 'preventive' => {
  if (product.stock === 0 || product.stock < product.minStock * 0.5) return 'critical';
  if (product.stock < product.minStock) return 'low';
  if (product.stock < product.minStock * 1.5) return 'preventive';
  return 'ok';
};

const buildDiffFlag = (form: ProductFormState, product?: ProductItem) => {
  if (!product) return true;
  return (
    form.name !== product.name ||
    form.price !== String(product.price) ||
    form.cost !== String(product.cost) ||
    form.minStock !== String(product.minStock) ||
    form.description !== (product.description ?? '') ||
    form.categoryId !== (product.categoryId ?? '') ||
    form.status !== product.status
  );
};

const ProductsCatalogPage = () => {
  const isDesktop = useIsDesktop();
  const [activePanel, setActivePanel] = useState<'productos' | 'editar' | 'movimientos'>(
    'productos',
  );
  const { categories } = useCategories();
  const {
    filters,
    setFilters,
    meta,
    counters,
    products,
    loading,
    error,
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
  const [movementsError, setMovementsError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState<'template-xlsx' | 'template-csv' | 'data' | null>(
    null,
  );
  const [importMode, setImportMode] = useState<'regular' | 'initial'>('regular');
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [editorTab, setEditorTab] = useState<'basic' | 'advanced' | 'suppliers'>('basic');

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
      setMovementsError(null);
      try {
        const response = await productsApi.movements(selectedId, { limit: 6 });
        setMovements(response.data ?? []);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'No se pudieron cargar movimientos';
        setMovementsError(message);
        setMovements(PRODUCT_MOVEMENTS);
      } finally {
        setMovementsLoading(false);
      }
    };
    loadMovements().catch(() => undefined);

    // Load product suppliers
    const loadProductSuppliers = async () => {
      if (selectedId) {
        const suppliers = await productsApi.getSuppliers(selectedId);
        setProductSuppliers(suppliers);
      }
    };
    loadProductSuppliers();
  }, [selectedId]);

  useEffect(() => {
    // Load available suppliers for dropdown
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
      // Optional: refresh list or show success toast
    } catch (err) {
      console.error('Error updating price', err);
    }
  };

  const visiblePanel = (panel: typeof activePanel) =>
    isDesktop || activePanel === panel ? '' : 'hidden-panel';

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveProduct();
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

  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    setImportSummary(null);
    try {
      const summary = await productsApi.importFile(uploadFile, importMode);
      setImportSummary(summary);
      await reload();
      setUploadFile(null);
      setImportMode('regular');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo importar el archivo';
      alert(message);
    } finally {
      setUploading(false);
    }
  };

  const closeBulkModal = () => {
    setShowBulkModal(false);
    setDownloading(null);
    setUploading(false);
    setUploadFile(null);
    setImportMode('regular');
  };

  const hasChanges = buildDiffFlag(formState, selectedProduct);
  const resultLabel = `Mostrando ${(products ?? []).length} de ${meta.total} productos`;

  const handleAlertFilter = (target: 'critical' | 'low' | 'preventive') => {
    setFilters((prev) => ({
      ...prev,
      stockState: target === 'critical' ? 'no-stock' : target === 'low' ? 'low' : 'preventive',
      page: 1,
    }));
  };

  return (
    <main className="products-view app-view is-visible" id="products-view" data-app-view>
      <header className="products-toolbar">
        <div className="toolbar-actions">
          <button className="tool-btn new" onClick={createNew}>
            + Nuevo
          </button>
          <button
            className="tool-btn edit"
            disabled={!selectedId}
            onClick={() => setActivePanel('editar')}
          >
            Editar
          </button>
          <button
            className="tool-btn delete"
            disabled={!selectedId}
            onClick={() => setShowDelete(true)}
          >
            Eliminar
          </button>
          <button className="tool-btn export" onClick={() => setShowBulkModal(true)}>
            Importar / Exportar
          </button>
        </div>
        <div className="toolbar-filters">
          <div className="search-field">
            <span className="search-icon">🔍</span>
            <input
              id="product-search"
              type="text"
              placeholder="Codigo/Nombre/Codigo de barras..."
              value={filters.search ?? ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
            />
            <button
              className="refresh-btn"
              aria-label="Refrescar lista"
              onClick={() => setFilters((prev) => ({ ...prev, search: '', page: 1 }))}
            >
              ⟳
            </button>
          </div>
          <div className="container-filter-chips">
            <div className="filter-chip">
              <span>Categorias</span>
              <select
                id="filter-category"
                value={filters.categoryId}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, categoryId: e.target.value, page: 1 }))
                }
              >
                <option value="all">Todas las categorias</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-chip">
              <span>Stock</span>
              <select
                id="filter-stock"
                value={filters.stockState}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, stockState: e.target.value as any, page: 1 }))
                }
              >
                <option value="all">Todos</option>
                <option value="with-stock">Con stock</option>
                <option value="low">Stock bajo</option>
                <option value="preventive">Preventivo</option>
                <option value="no-stock">Sin stock</option>
              </select>
            </div>
            <div className="filter-chip">
              <span>Estado</span>
              <select
                id="filter-status"
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: e.target.value as ProductStatus | 'all',
                    page: 1,
                  }))
                }
              >
                <option value="all">Todos</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="descontinuado">Descontinuado</option>
              </select>
            </div>
            <span className="muted">{resultLabel}</span>
          </div>
        </div>
      </header>

      <div className={`products-tabs ${!isDesktop ? 'visible' : ''}`} id="products-tabs">
        <button
          type="button"
          data-product-tab="productos"
          className={activePanel === 'productos' ? 'active' : ''}
          onClick={() => setActivePanel('productos')}
        >
          Productos
        </button>
        <button
          type="button"
          data-product-tab="editar"
          className={activePanel === 'editar' ? 'active' : ''}
          onClick={() => setActivePanel('editar')}
        >
          Editar
        </button>
        <button
          type="button"
          data-product-tab="movimientos"
          className={activePanel === 'movimientos' ? 'active' : ''}
          onClick={() => setActivePanel('movimientos')}
        >
          Movimientos
        </button>
      </div>

      <div className="products-grid">
        <section
          className={`products-column ${visiblePanel('productos')}`}
          data-product-panel="productos"
        >
          <article className="products-table-card">
            <header className="card-header" style={{ marginBottom: 8 }}>
              <h3 style={{ margin: 0 }}>Lista de productos</h3>
              <span className="muted">Selecciona un producto para editarlo</span>
            </header>
            <div className="products-table-wrapper">
              <table className="products-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>CB</th>
                    <th style={{ width: 100 }}>Codigo</th>
                    <th>Nombre</th>
                    <th style={{ width: 140 }}>Categoria</th>
                    <th style={{ width: 90 }}>Stock</th>
                    <th style={{ width: 90, textAlign: 'right' }}>PVP</th>
                    <th style={{ width: 110 }}>Estado</th>
                    <th style={{ width: 110 }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && products.length === 0 && (
                    <tr>
                      <td colSpan={8} className="muted">
                        No se encontraron productos con estos filtros.
                      </td>
                    </tr>
                  )}
                  {loading && (
                    <tr>
                      <td colSpan={8} className="muted">
                        Cargando catalogo...
                      </td>
                    </tr>
                  )}
                  {products.map((product) => {
                    const state = stockState(product);
                    const statusLabel =
                      product.status === 'activo'
                        ? 'Activo'
                        : product.status === 'inactivo'
                          ? 'Inactivo'
                          : 'Descontinuado';
                    return (
                      <tr
                        key={product.id}
                        data-product-id={product.id}
                        className={`${product.id === selectedId ? 'selected' : ''} ${state !== 'ok' ? 'has-warning' : ''}`}
                        onClick={() => {
                          selectProduct(product.id);
                          if (!isDesktop) setActivePanel('editar');
                        }}
                      >
                        <td>
                          <input
                            type="checkbox"
                            aria-label={`Seleccionar ${product.name}`}
                            checked={product.id === selectedId}
                            readOnly
                          />
                        </td>
                        <td>{product.code}</td>
                        <td>{product.name}</td>
                        <td className="muted">{product.category ?? product.categoryName}</td>
                        <td>
                          <span className={`stock-dot ${state}`}></span>
                          {product.stock}
                        </td>
                        <td className="align-right">{formatCurrency(product.price)}</td>
                        <td>
                          <span className={`status-chip status-${product.status}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="row-actions">
                          <button
                            type="button"
                            aria-label={`Editar ${product.name}`}
                            onClick={() => selectProduct(product.id)}
                          >
                            ✎
                          </button>
                          <button
                            type="button"
                            aria-label={`Ver movimientos ${product.name}`}
                            onClick={() => setActivePanel('movimientos')}
                          >
                            ↺
                          </button>
                          <button
                            type="button"
                            aria-label={`Duplicar ${product.name}`}
                            onClick={() =>
                              setFormState((prev) => ({
                                ...prev,
                                code: `${prev.code}-COPIA`,
                                name: `${prev.name} (copia)`,
                              }))
                            }
                          >
                            ⧉
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="product-card-list">
                {products.map((product) => {
                  const state = stockState(product);
                  const warnLabel =
                    state === 'critical'
                      ? 'Stock critico'
                      : state === 'low'
                        ? 'Stock bajo'
                        : state === 'preventive'
                          ? 'Preventivo'
                          : 'En nivel seguro';
                  return (
                    <article
                      className={`product-card ${product.id === selectedId ? 'selected' : ''}`}
                      data-product-id={product.id}
                      key={product.id}
                      onClick={() => selectProduct(product.id)}
                    >
                      <header>
                        <div>
                          <strong>{product.name}</strong>
                          <div className="muted">{product.code}</div>
                        </div>
                        <span className={`status-chip status-${product.status}`}>
                          {product.status}
                        </span>
                      </header>
                      <p className="muted">
                        Stock: {product.stock} | {formatCurrency(product.price)}
                      </p>
                      <div
                        className={`alert-pill ${warnLabel === 'En nivel seguro' ? 'soft' : ''}`}
                      >
                        {warnLabel}
                      </div>
                      <div className="card-actions">
                        <button type="button">Edit</button>
                        <button type="button">Mov</button>
                        <button type="button">Dup</button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
            <footer className="table-footer">
              <div>
                Pagina {meta.page} de {Math.max(1, Math.ceil(meta.total / meta.pageSize))}
              </div>
              <div className="pagination">
                <button
                  type="button"
                  aria-label="Anterior"
                  disabled={meta.page <= 1}
                  onClick={() => setPage(Math.max(1, meta.page - 1))}
                >
                  &lt;
                </button>
                <button type="button" aria-current="page">
                  {meta.page}
                </button>
                <button
                  type="button"
                  disabled={meta.page * meta.pageSize >= meta.total}
                  onClick={() => setPage(meta.page + 1)}
                >
                  {meta.page + 1}
                </button>
              </div>
            </footer>
          </article>

          <article className="alerts-card">
            <header className="card-header" style={{ marginBottom: 10 }}>
              <h3 style={{ margin: 0 }}>Alertas de stock</h3>
            </header>
            <div className="alerts-grid">
              <button
                className="alert-box critical"
                type="button"
                onClick={() => handleAlertFilter('critical')}
              >
                <strong id="alert-critical-count">{counters.critical} productos</strong>
                <p className="muted">Critico: stock = 0 o &lt; 50% minimo</p>
              </button>
              <button
                className="alert-box low"
                type="button"
                onClick={() => handleAlertFilter('low')}
              >
                <strong id="alert-low-count">{counters.low} productos</strong>
                <p className="muted">Bajo: stock por debajo del minimo</p>
              </button>
              <button
                className="alert-box preventive"
                type="button"
                onClick={() => handleAlertFilter('preventive')}
              >
                <strong id="alert-prevent-count">{counters.preventive} productos</strong>
                <p className="muted">Preventivo: stock &lt; 1.5 x minimo</p>
              </button>
            </div>
          </article>

          <article className="movement-card desktop-only">
            <header className="card-header" style={{ marginBottom: 8 }}>
              <h3 style={{ margin: 0 }}>Movimientos recientes</h3>
            </header>
            {movementsLoading && <div className="muted">Cargando movimientos...</div>}
            {movementsError && <div className="muted">{movementsError}</div>}
            <div id="movement-list">
              {movements.map((movement) => (
                <div className="movement-row" key={movement.id}>
                  <div>
                    <strong>{movement.product ?? selectedProduct?.name ?? movement.id}</strong>
                    <div className="muted">
                      {movement.datetime} • {movement.document ?? 'N/D'}
                    </div>
                  </div>
                  <div className={`movement-pill ${movement.qty >= 0 ? 'up' : 'down'}`}>
                    {movement.type} {movement.qty >= 0 ? '+' : ''}
                    {movement.qty}
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <aside
          className={`products-column editor-panel ${visiblePanel('editar')}`}
          data-product-panel="editar"
        >
          <article className="editor-card">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="tab-group">
                <button
                  className={`tab-btn ${editorTab === 'basic' ? 'active' : ''}`}
                  onClick={() => setEditorTab('basic')}
                >
                  Basico
                </button>
                <button
                  className={`tab-btn ${editorTab === 'advanced' ? 'active' : ''}`}
                  onClick={() => setEditorTab('advanced')}
                >
                  Avanzado
                </button>
                <button
                  className={`tab-btn ${editorTab === 'suppliers' ? 'active' : ''}`}
                  onClick={() => setEditorTab('suppliers')}
                >
                  Proveedores
                </button>

              </div>
              {hasChanges && <span className="muted text-sm">Cambios sin guardar</span>}
            </div>

            {editorTab === 'basic' && (
              <div className="animate-fade-in">
                <div className="field-grid">
                  <div className="field full">
                    <label htmlFor="product-name-input">Nombre del producto *</label>
                    <input
                      id="product-name-input"
                      type="text"
                      maxLength={100}
                      placeholder="Ej: Martillo de uña 16oz"
                      value={formState.name}
                      onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                      autoFocus
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="product-price-input">Precio Venta *</label>
                    <div className="input-group">
                      <span className="prefix">Q</span>
                      <input
                        id="product-price-input"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formState.price}
                        onChange={(e) => setFormState((prev) => ({ ...prev, price: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="product-cost-input">Costo (Opcional)</label>
                    <div className="input-group">
                      <span className="prefix">Q</span>
                      <input
                        id="product-cost-input"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formState.cost}
                        onChange={(e) => setFormState((prev) => ({ ...prev, cost: e.target.value }))}
                      />
                    </div>
                  </div>

                  {mode === 'create' && (
                    <div className="field">
                      <label htmlFor="product-init-stock">Stock Inicial</label>
                      <input
                        id="product-init-stock"
                        type="number"
                        placeholder="0"
                        value={formState.initialStock}
                        onChange={(e) => setFormState((prev) => ({ ...prev, initialStock: e.target.value }))}
                      />
                      <p className="help-text">Se creara un movimiento de entrada automatico.</p>
                    </div>
                  )}

                  {mode === 'edit' && (
                    <div className="field">
                      <label>Stock Actual</label>
                      <input
                        type="number"
                        readOnly
                        disabled
                        value={selectedProduct?.stock ?? 0}
                        className="bg-gray-100"
                      />
                      <p className="help-text">Gestionar en pestaña Movimientos</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {editorTab === 'advanced' && (
              <div className="animate-fade-in">
                <div className="field-grid">
                  <div className="field">
                    <label htmlFor="product-code-input">Codigo</label>
                    <input
                      id="product-code-input"
                      type="text"
                      placeholder="Autogenerado (P-###)"
                      value={formState.code}
                      onChange={(e) => setFormState((prev) => ({ ...prev, code: e.target.value }))}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="product-barcode-input">Codigo de Barras</label>
                    <input
                      id="product-barcode-input"
                      type="text"
                      placeholder="Escanear..."
                      value={formState.barcode}
                      onChange={(e) => setFormState((prev) => ({ ...prev, barcode: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="field-grid full">
                  <div className="field">
                    <label htmlFor="product-description-input">Descripcion</label>
                    <textarea
                      id="product-description-input"
                      rows={2}
                      placeholder="Detalles adicionales..."
                      value={formState.description}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, description: e.target.value }))
                      }
                    ></textarea>
                  </div>
                </div>

                <p className="section-eyebrow mt-4">Configuracion</p>
                <div className="field-grid">
                  <div className="field">
                    <label htmlFor="product-category-input">Categoria</label>
                    <select
                      id="product-category-input"
                      value={formState.categoryId}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, categoryId: e.target.value }))
                      }
                    >
                      {categories.map((cat) => (
                        <option value={cat.id} key={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="product-tax-input">Impuesto</label>
                    <select
                      id="product-tax-input"
                      value={formState.tax}
                      onChange={(e) => setFormState((prev) => ({ ...prev, tax: e.target.value }))}
                    >
                      <option value="0">Exento (0%)</option>
                      <option value="12">IVA (12%)</option>
                      <option value="15">15%</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="product-unit-input">Unidad</label>
                    <select
                      id="product-unit-input"
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
                  <div className="field">
                    <label htmlFor="product-min-input">Stock Minimo</label>
                    <input
                      id="product-min-input"
                      type="number"
                      placeholder="0"
                      value={formState.minStock}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, minStock: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="field-grid full mt-4">
                  <div className="field">
                    <label>Estado</label>
                    <div className="row-actions">
                      {(['activo', 'inactivo', 'descontinuado'] as ProductStatus[]).map((status) => (
                        <label key={status} className={`status-chip status-${status} cursor-pointer`}>
                          <input
                            type="radio"
                            name="product-status"
                            className="mr-2"
                            checked={formState.status === status}
                            onChange={() => setFormState((prev) => ({ ...prev, status }))}
                          />
                          {status}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {editorTab === 'suppliers' && (
              <div className="animate-fade-in">
                <div className="bg-slate-50 p-4 rounded-lg mb-4 border border-slate-200">
                  <h4 className="font-medium mb-3 text-sm text-slate-700">Agregar Proveedor</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Proveedor</label>
                      <select
                        className="w-full p-2 rounded border border-slate-300 text-sm"
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
                      <label className="block text-xs font-medium text-slate-500 mb-1">Costo (Q)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full p-2 rounded border border-slate-300 text-sm"
                        placeholder="0.00"
                        value={newSupplierCost}
                        onChange={(e) => setNewSupplierCost(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Código Producto (Opcional)</label>
                      <input
                        type="text"
                        className="w-full p-2 rounded border border-slate-300 text-sm"
                        placeholder="Ej. PROD-001"
                        value={newSupplierCode}
                        onChange={(e) => setNewSupplierCode(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center pt-5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newSupplierIsMain}
                          onChange={(e) => setNewSupplierIsMain(e.target.checked)}
                        />
                        <span className="text-sm text-slate-700">Proveedor Principal</span>
                      </label>
                    </div>
                  </div>
                  <button
                    className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
                    onClick={handleAddSupplier}
                    disabled={!newSupplierId || !newSupplierCost}
                  >
                    Agregar Proveedor
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 text-slate-600">
                      <tr>
                        <th className="p-2 text-left">Proveedor</th>
                        <th className="p-2 text-left">Código</th>
                        <th className="p-2 text-right">Costo</th>
                        <th className="p-2 text-center">Principal</th>
                        <th className="p-2 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {productSuppliers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-slate-500 italic">
                            No hay proveedores asignados
                          </td>
                        </tr>
                      ) : (
                        productSuppliers.map((ps) => (
                          <tr key={ps.id_proveedor}>
                            <td className="p-2">{ps.nombre_proveedor || 'Proveedor ' + ps.id_proveedor}</td>
                            <td className="p-2 text-slate-500">{ps.codigo_producto_proveedor || '-'}</td>
                            <td className="p-2 text-right font-medium">
                              <input
                                type="number"
                                step="0.01"
                                className="w-20 p-1 text-right border border-transparent hover:border-slate-300 rounded focus:border-blue-500 outline-none"
                                defaultValue={ps.precio_costo}
                                onBlur={(e) => handleUpdateSupplierPrice(ps.id_proveedor, e.target.value)}
                              />
                            </td>
                            <td className="p-2 text-center">
                              {ps.es_proveedor_principal ? (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">Principal</span>
                              ) : '-'}
                            </td>
                            <td className="p-2 text-center">
                              <button
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleRemoveSupplier(ps.id_proveedor)}
                              >
                                ✕
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

            <div className="form-actions mt-6 pt-4 border-t border-gray-200">
              <button className="btn-primary" disabled={saving} onClick={handleSave}>
                {mode === 'create' ? 'Crear Producto' : 'Guardar Cambios'}
              </button>
              <button className="btn-outline" onClick={() => selectProduct(selectedId)}>
                Cancelar
              </button>
              {mode === 'edit' && (
                <button
                  className="btn-danger ml-auto"
                  disabled={!selectedId}
                  onClick={() => setShowDelete(true)}
                >
                  Eliminar
                </button>
              )}
            </div>
            {error && <p className="error-message mt-2 text-red-600">{error}</p>}
          </article>
        </aside>
      </div>

      <section
        className={`movement-card mobile-only ${visiblePanel('movimientos')}`}
        data-product-panel="movimientos"
      >
        <header className="card-header" style={{ marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>Movimientos recientes</h3>
        </header>
        <div id="movement-list-tab">
          {movementsLoading && <div className="muted">Cargando movimientos...</div>}
          {movementsError && <div className="muted">{movementsError}</div>}
          {movements.map((movement) => (
            <div className="movement-row" key={`${movement.id}-mobile`}>
              <div>
                <strong>{movement.product ?? selectedProduct?.name ?? movement.id}</strong>
                <div className="muted">
                  {movement.datetime} • {movement.document ?? 'N/D'}
                </div>
              </div>
              <div className={`movement-pill ${movement.qty >= 0 ? 'up' : 'down'}`}>
                {movement.type} {movement.qty >= 0 ? '+' : ''}
                {movement.qty}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Modal
        open={showBulkModal}
        title="Importar / Exportar productos"
        description="Descarga la plantilla Excel con listas o CSV simple. El backend valida catalogos y controla stock/fechas."
        onClose={() => {
          closeBulkModal();
          setImportSummary(null);
        }}
        footer={
          <button
            type="button"
            className="btn-outline"
            onClick={() => {
              closeBulkModal();
              setImportSummary(null);
            }}
          >
            Cerrar
          </button>
        }
      >
        <div className="bulk-modal-grid">
          <div className="bulk-card">
            <p className="section-eyebrow">Plantillas y exportaciones</p>
            <h4 style={{ margin: '4px 0' }}>Evita errores de catalogos</h4>
            <p className="muted">
              Excel incluye listas desplegables para categoryCode, unit, status y tax. CSV queda
              para quien prefiera edicion plana.
            </p>
            <div className="bulk-actions">
              <button
                className="btn-primary"
                type="button"
                onClick={() => handleDownload('template-xlsx')}
                disabled={downloading === 'template-xlsx'}
              >
                {downloading === 'template-xlsx' ? 'Generando...' : 'Excel con listas'}
              </button>
              <button
                className="btn-outline"
                type="button"
                onClick={() => handleDownload('template-csv')}
                disabled={downloading === 'template-csv'}
              >
                {downloading === 'template-csv' ? 'Generando...' : 'Plantilla CSV'}
              </button>
              <button
                className="btn-outline"
                type="button"
                onClick={() => handleDownload('data')}
                disabled={downloading === 'data'}
              >
                {downloading === 'data' ? 'Exportando...' : 'Exportar actuales'}
              </button>
            </div>
          </div>
          <div className="bulk-card">
            <p className="section-eyebrow">Carga masiva de productos</p>
            <h4 style={{ margin: '4px 0' }}>Importar XLSX o CSV</h4>
            <p className="muted">
              Validamos codigo, categoria, unidad, estado, impuesto y numeros. El stock se ignora en
              modo normal.
            </p>
            <div className="row-actions" style={{ gap: 8, flexWrap: 'wrap' }}>
              {[
                { value: 'regular' as const, label: 'Modo normal (ignora stock)' },
                { value: 'initial' as const, label: 'Carga inicial (usa stock)' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`status-chip ${importMode === option.value ? 'status-activo' : ''}`}
                >
                  <input
                    type="radio"
                    name="import-mode"
                    checked={importMode === option.value}
                    onChange={() => setImportMode(option.value)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
            <div className="upload-field">
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
              />
              {uploadFile && <span className="muted">Archivo seleccionado: {uploadFile.name}</span>}
            </div>
            <button
              className="btn-primary"
              type="button"
              disabled={!uploadFile || uploading}
              onClick={handleUpload}
            >
              {uploading ? 'Procesando...' : 'Subir archivo'}
            </button>
          </div>
        </div>
        <div className="bulk-card" style={{ marginTop: 12 }}>
          <p className="section-eyebrow">Guia rapida</p>
          <div className="field-grid full">
            <div>
              <strong>El cliente rellena</strong>
              <p className="muted">
                code, name, description, categoryCode, cost, price, tax, unit, minStock, status,
                barcode.
              </p>
            </div>
            <div>
              <strong>El sistema controla</strong>
              <p className="muted">
                stock (solo se toma en modo inicial), createdAt y updatedAt siempre se generan en
                backend.
              </p>
            </div>
          </div>
        </div>

        {importSummary && (
          <div className="import-summary">
            <p className="section-eyebrow">Resumen de importacion</p>
            <div className="summary-grid">
              <div className="summary-box">
                <strong>{importSummary.totalRows}</strong>
                <span className="muted">Filas procesadas</span>
              </div>
              <div className="summary-box success">
                <strong>{importSummary.inserted}</strong>
                <span className="muted">Nuevos productos</span>
              </div>
              <div className="summary-box info">
                <strong>{importSummary.updated}</strong>
                <span className="muted">Actualizados</span>
              </div>
            </div>
            {importSummary.errors.length > 0 ? (
              <div className="error-list">
                <p className="muted">Errores encontrados</p>
                <ul>
                  {importSummary.errors.slice(0, 10).map((err) => (
                    <li key={`${err.row}-${err.message}`}>
                      Fila {err.row}: {err.message}
                    </li>
                  ))}
                </ul>
                {importSummary.errors.length > 10 && (
                  <p className="muted">
                    Se muestran los primeros 10 errores de {importSummary.errors.length}.
                  </p>
                )}
              </div>
            ) : (
              <p className="muted">Sin errores reportados.</p>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={showDelete}
        title="Eliminar producto"
        description="Esta accion marcara el producto como descontinuado. Deseas continuar?"
        onClose={() => setShowDelete(false)}
        footer={
          <>
            <button type="button" className="btn-outline" onClick={() => setShowDelete(false)}>
              Cancelar
            </button>
            <button type="button" className="btn-danger" onClick={handleDelete}>
              Confirmar
            </button>
          </>
        }
      >
        <p className="text-sm">
          Solo se marcara como descontinuado para mantener auditoria y stock historico.
        </p>
      </Modal>
    </main>
  );
};

export default ProductsCatalogPage;
