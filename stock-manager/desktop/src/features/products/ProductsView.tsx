import { useEffect, useMemo, useState } from 'react';
import {
  INVENTORY_DETAIL,
  INVENTORY_OVERVIEW,
  INVENTORY_WAREHOUSES,
  PRODUCT_CATALOG,
  PRODUCT_MOVEMENTS
} from '@/shared/data/products';
import type { ProductItem, ProductStatus, ProductTab } from '@/shared/types/products';
import { formatCurrency } from '@/shared/utils/format';
import { DESKTOP_BREAKPOINT } from '@/shared/constants/layout';

type ProductFormState = {
  code: string;
  name: string;
  description: string;
  category: string;
  barcode: string;
  cost: string;
  price: string;
  tax: string;
  stock: string;
  minStock: string;
  unit: string;
};

const getStockState = (product: ProductItem): 'ok' | 'low' | 'critical' | 'preventive' => {
  if (product.stock === 0 || product.stock < product.minStock * 0.5) return 'critical';
  if (product.stock < product.minStock) return 'low';
  if (product.stock < product.minStock * 1.5) return 'preventive';
  return 'ok';
};

const ProductsView = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [status, setStatus] = useState<ProductStatus | 'all'>('all');
  const [productTab, setProductTab] = useState<ProductTab>('productos');
  const [selectedId, setSelectedId] = useState(PRODUCT_CATALOG[0]?.id ?? '');
  const selectedProduct = useMemo(() => PRODUCT_CATALOG.find((p) => p.id === selectedId) ?? PRODUCT_CATALOG[0], [selectedId]);

  const [formState, setFormState] = useState<ProductFormState>(() => ({
    code: selectedProduct?.code ?? '',
    name: selectedProduct?.name ?? '',
    description: selectedProduct ? `Ficha para ${selectedProduct.name}` : '',
    category: selectedProduct?.category ?? '',
    barcode: selectedProduct?.barcode ?? '',
    cost: selectedProduct ? selectedProduct.cost.toFixed(2) : '',
    price: selectedProduct ? selectedProduct.price.toFixed(2) : '',
    tax: selectedProduct ? `${selectedProduct.tax}%` : '12%',
    stock: selectedProduct ? String(selectedProduct.stock) : '',
    minStock: selectedProduct ? String(selectedProduct.minStock) : '',
    unit: selectedProduct?.unit ?? 'unidad'
  }));

  useEffect(() => {
    if (!selectedProduct) return;
    setFormState({
      code: selectedProduct.code,
      name: selectedProduct.name,
      description: `Ficha para ${selectedProduct.name}`,
      category: selectedProduct.category,
      barcode: selectedProduct.barcode,
      cost: selectedProduct.cost.toFixed(2),
      price: selectedProduct.price.toFixed(2),
      tax: `${selectedProduct.tax}%`,
      stock: String(selectedProduct.stock),
      minStock: String(selectedProduct.minStock),
      unit: selectedProduct.unit
    });
  }, [selectedProduct]);

  const filteredProducts = useMemo(() => {
    return PRODUCT_CATALOG.filter((product) => {
      const haystack = `${product.code} ${product.name} ${product.barcode}`.toLowerCase();
      const matchesSearch = !search || haystack.includes(search.toLowerCase().trim());
      const matchesCategory = category === 'all' || product.category === category;
      const matchesStatus = status === 'all' || product.status === status;
      const matchesStock =
        stockFilter === 'all'
          ? true
          : stockFilter === 'with-stock'
          ? product.stock > 0
          : stockFilter === 'low'
          ? product.stock < product.minStock
          : stockFilter === 'no-stock'
          ? product.stock === 0
          : true;
      return matchesSearch && matchesCategory && matchesStatus && matchesStock;
    });
  }, [search, category, status, stockFilter]);

  const stockCounts = useMemo(() => {
    const critical = filteredProducts.filter((p) => p.stock === 0 || p.stock < p.minStock * 0.5).length;
    const low = filteredProducts.filter((p) => p.stock > 0 && p.stock < p.minStock).length;
    const preventive = filteredProducts.filter((p) => p.stock >= p.minStock && p.stock < p.minStock * 1.5).length;
    return { critical, low, preventive };
  }, [filteredProducts]);

  const movements = useMemo(() => {
    const code = selectedProduct?.code ?? '';
    const related = PRODUCT_MOVEMENTS.filter((move) => move.product.startsWith(code)).slice(0, 6);
    return related.length ? related : PRODUCT_MOVEMENTS.slice(0, 6);
  }, [selectedProduct]);

  const visiblePanel = (panel: ProductTab) => (window.innerWidth >= DESKTOP_BREAKPOINT || productTab === panel ? '' : 'hidden-panel');

  const onSelectProduct = (id: string) => {
    setSelectedId(id);
    if (window.innerWidth < DESKTOP_BREAKPOINT) {
      setProductTab('editar');
    }
  };

  return (
    <main className="products-view app-view is-visible" id="products-view" data-app-view>
      <header className="products-toolbar">
        <div className="toolbar-actions">
          <button className="tool-btn new">+ Nuevo</button>
          <button className="tool-btn edit">Editar</button>
          <button className="tool-btn delete" disabled>
            Eliminar
          </button>
          <button className="tool-btn export">Exportar</button>
          <button className="tool-btn import">Importar</button>
        </div>
        <div className="toolbar-filters">
          <div className="search-field">
            <span className="search-icon">🔍</span>
            <input
              id="product-search"
              type="text"
              placeholder="Codigo/Nombre/Codigo de barras..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="refresh-btn" aria-label="Refrescar lista" onClick={() => setSearch('')}>
              🔄
            </button>
          </div>
          <div className="filter-chip">
            <span>Categorias</span>
            <select id="filter-category" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">Todas las categorias</option>
              <option value="Bebidas">Bebidas</option>
              <option value="Panaderia">Panaderia</option>
            </select>
          </div>
          <div className="filter-chip">
            <span>Stock</span>
            <select id="filter-stock" value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
              <option value="all">Todos</option>
              <option value="with-stock">Con stock</option>
              <option value="low">Stock bajo</option>
              <option value="no-stock">Sin stock</option>
            </select>
          </div>
          <div className="filter-chip">
            <span>Estado</span>
            <select id="filter-status" value={status} onChange={(e) => setStatus(e.target.value as ProductStatus | 'all')}>
              <option value="all">Todos</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="descontinuado">Descontinuado</option>
            </select>
          </div>
        </div>
      </header>

      <div className={`products-tabs ${window.innerWidth < DESKTOP_BREAKPOINT ? 'visible' : ''}`} id="products-tabs">
        <button type="button" data-product-tab="productos" className={productTab === 'productos' ? 'active' : ''} onClick={() => setProductTab('productos')}>
          Productos
        </button>
        <button type="button" data-product-tab="editar" className={productTab === 'editar' ? 'active' : ''} onClick={() => setProductTab('editar')}>
          Editar
        </button>
        <button type="button" data-product-tab="movimientos" className={productTab === 'movimientos' ? 'active' : ''} onClick={() => setProductTab('movimientos')}>
          Movimientos
        </button>
      </div>

      <div className="products-grid">
        <section className={`products-column ${visiblePanel('productos')}`} data-product-panel="productos">
          <article className="products-table-card">
            <header className="card-header" style={{ marginBottom: 8 }}>
              <h3 style={{ margin: 0 }}>Lista de productos</h3>
              <span className="muted">Cabecera fija, seleccion multiple y acciones por fila</span>
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
                  {filteredProducts.map((product) => {
                    const stockState = getStockState(product);
                    const statusLabel = product.status === 'activo' ? 'Activo' : product.status === 'inactivo' ? 'Inactivo' : 'Descontinuado';
                    return (
                      <tr key={product.id} data-product-id={product.id} className={product.id === selectedId ? 'selected' : ''} onClick={() => onSelectProduct(product.id)}>
                        <td>
                          <input type="checkbox" aria-label={`Seleccionar ${product.name}`} checked={product.id === selectedId} readOnly />
                        </td>
                        <td>{product.code}</td>
                        <td>{product.name}</td>
                        <td className="muted">{product.category}</td>
                        <td>
                          <span className={`stock-dot ${stockState}`}></span>
                          {product.stock}
                        </td>
                        <td className="align-right">Q{product.price.toFixed(2)}</td>
                        <td>
                          <span className={`status-chip status-${product.status}`}>{statusLabel}</span>
                        </td>
                        <td className="row-actions">
                          <button type="button" aria-label={`Editar ${product.name}`}>
                            Edit
                          </button>
                          <button type="button" aria-label={`Ver movimientos ${product.name}`}>
                            Mov
                          </button>
                          <button type="button" aria-label={`Duplicar ${product.name}`}>
                            Dup
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="product-card-list">
                {filteredProducts.map((product) => {
                  const stockState = getStockState(product);
                  const warnLabel = stockState === 'critical' ? 'Stock critico' : stockState === 'low' ? 'Stock bajo' : 'En nivel seguro';
                  return (
                    <article
                      className={`product-card ${product.id === selectedId ? 'selected' : ''}`}
                      data-product-id={product.id}
                      key={product.id}
                      onClick={() => onSelectProduct(product.id)}
                    >
                      <header>
                        <div>
                          <strong>{product.name}</strong>
                          <div className="muted">{product.code}</div>
                        </div>
                        <span className={`status-chip status-${product.status}`}>{product.status}</span>
                      </header>
                      <p className="muted">
                        Stock: {product.stock} | Q{product.price.toFixed(2)}
                      </p>
                      <div className={`alert-pill ${warnLabel === 'En nivel seguro' ? 'soft' : ''}`}>{warnLabel}</div>
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
              <div>Pagina 1 de 15</div>
              <div className="pagination">
                <button type="button" aria-label="Anterior">
                  &lt;
                </button>
                <button type="button" aria-current="page">
                  1
                </button>
                <button type="button">2</button>
                <button type="button">3</button>
                <span className="muted">...</span>
                <button type="button" aria-label="Siguiente">
                  &gt;
                </button>
              </div>
            </footer>
          </article>

          <article className="alerts-card">
            <header className="card-header" style={{ marginBottom: 10 }}>
              <h3 style={{ margin: 0 }}>Alertas de stock</h3>
            </header>
            <div className="alerts-grid">
              <div className="alert-box critical">
                <strong id="alert-critical-count">{stockCounts.critical} productos</strong>
                <p className="muted">Critico: stock = 0 o &lt; 50% minimo</p>
              </div>
              <div className="alert-box low">
                <strong id="alert-low-count">{stockCounts.low} productos</strong>
                <p className="muted">Bajo: stock por debajo del minimo</p>
              </div>
              <div className="alert-box preventive">
                <strong id="alert-prevent-count">{stockCounts.preventive} productos</strong>
                <p className="muted">Preventivo: stock &lt; 1.5 x minimo</p>
              </div>
            </div>
          </article>

          <article className="movement-card desktop-only">
            <header className="card-header" style={{ marginBottom: 8 }}>
              <h3 style={{ margin: 0 }}>Movimientos recientes</h3>
            </header>
            <div id="movement-list">
              {movements.map((movement) => (
                <div className="movement-row" key={movement.id}>
                  <div>
                    <strong>{movement.product}</strong>
                    <div className="muted">
                      {movement.datetime} • {movement.document}
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

          <article className="existence-card">
            <header className="card-header" style={{ marginBottom: 8 }}>
              <h3 style={{ margin: 0 }}>Reporte de existencias</h3>
            </header>
            <div className="toolbar-filters" style={{ gap: 8, flexWrap: 'wrap' }}>
              <div className="filter-chip">
                <span>Almacen</span>
                <select>
                  <option>Almacen Central</option>
                  <option>Sucursal 1</option>
                </select>
              </div>
              <div className="filter-chip">
                <span>Categoria</span>
                <select>
                  <option>Todas</option>
                  <option>Bebidas</option>
                  <option>Panaderia</option>
                </select>
              </div>
              <div className="filter-chip">
                <span>Fecha hasta</span>
                <input type="date" />
              </div>
            </div>
            <div className="kpi-row">
              <div className="kpi-chip">
                <small className="muted">Valor inventario</small>
                <div id="inventory-kpi-value">{formatCurrency(INVENTORY_OVERVIEW.inventoryValue)}</div>
              </div>
              <div className="kpi-chip">
                <small className="muted">Productos con stock</small>
                <div id="inventory-kpi-stock">{INVENTORY_OVERVIEW.productsWithStock}</div>
              </div>
              <div className="kpi-chip">
                <small className="muted">Stock bajo</small>
                <div id="inventory-kpi-low">{INVENTORY_OVERVIEW.lowStock}</div>
              </div>
              <div className="kpi-chip">
                <small className="muted">Rotacion promedio</small>
                <div id="inventory-kpi-rotation">{INVENTORY_OVERVIEW.rotation}</div>
              </div>
            </div>
            <h4 style={{ margin: '6px 0 4px' }}>Detalle por producto</h4>
            <table className="simple-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Stock</th>
                  <th>Valor</th>
                  <th>Ultimo mov.</th>
                  <th>Rotacion</th>
                  <th>Almacen</th>
                </tr>
              </thead>
              <tbody>
                {INVENTORY_DETAIL.map((item) => (
                  <tr key={`${item.product}-${item.warehouse}`}>
                    <td>{item.product}</td>
                    <td>{item.stock}</td>
                    <td>{formatCurrency(item.value)}</td>
                    <td>{item.last}</td>
                    <td>{item.rotation}</td>
                    <td>{item.warehouse}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h4 style={{ margin: '10px 0 4px' }}>Stock por almacen</h4>
            <table className="simple-table">
              <thead>
                <tr>
                  <th>Almacen</th>
                  <th>Productos</th>
                  <th>Valor</th>
                  <th>% Total</th>
                  <th>Capacidad</th>
                </tr>
              </thead>
              <tbody>
                {INVENTORY_WAREHOUSES.map((warehouse) => (
                  <tr key={warehouse.warehouse}>
                    <td>{warehouse.warehouse}</td>
                    <td>{warehouse.products}</td>
                    <td>{formatCurrency(warehouse.value)}</td>
                    <td>{warehouse.percentage}%</td>
                    <td>{warehouse.capacity}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>
        </section>

        <aside className={`products-column editor-panel ${visiblePanel('editar')}`} data-product-panel="editar">
          <article className="editor-card">
            <div>
              <p className="section-eyebrow">Informacion basica</p>
              <div className="field-grid">
                <div className="field">
                  <label htmlFor="product-code-input">Codigo *</label>
                  <input
                    id="product-code-input"
                    type="text"
                    placeholder="P###"
                    value={formState.code}
                    onChange={(e) => setFormState((prev) => ({ ...prev, code: e.target.value }))}
                  />
                </div>
                <div className="field">
                  <label htmlFor="product-name-input">Nombre *</label>
                  <input
                    id="product-name-input"
                    type="text"
                    maxLength={100}
                    placeholder="Nombre del producto"
                    value={formState.name}
                    onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
              </div>
              <div className="field-grid full">
                <div className="field">
                  <label htmlFor="product-description-input">Descripcion</label>
                  <textarea
                    id="product-description-input"
                    rows={3}
                    placeholder="Notas y detalles"
                    value={formState.description}
                    onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
                  ></textarea>
                </div>
              </div>
            </div>

            <div>
              <p className="section-eyebrow">Precios y costos</p>
              <div className="field-grid">
                <div className="field">
                  <label htmlFor="product-cost-input">Costo</label>
                  <input
                    id="product-cost-input"
                    type="number"
                    step="0.01"
                    placeholder="Q0.00"
                    value={formState.cost}
                    onChange={(e) => setFormState((prev) => ({ ...prev, cost: e.target.value }))}
                  />
                </div>
                <div className="field">
                  <label htmlFor="product-price-input">Precio venta</label>
                  <input
                    id="product-price-input"
                    type="number"
                    step="0.01"
                    placeholder="Q0.00"
                    value={formState.price}
                    onChange={(e) => setFormState((prev) => ({ ...prev, price: e.target.value }))}
                  />
                </div>
                <div className="field">
                  <label htmlFor="product-tax-input">Impuesto</label>
                  <select id="product-tax-input" value={formState.tax} onChange={(e) => setFormState((prev) => ({ ...prev, tax: e.target.value }))}>
                    <option value="0%">0%</option>
                    <option value="12%">12%</option>
                    <option value="15%">15%</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="product-unit-input">Unidad de medida</label>
                  <select id="product-unit-input" value={formState.unit} onChange={(e) => setFormState((prev) => ({ ...prev, unit: e.target.value }))}>
                    <option value="unidad">Unidad</option>
                    <option value="kg">Kg</option>
                    <option value="litro">Litro</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <p className="section-eyebrow">Stock y almacenaje</p>
              <div className="field-grid">
                <div className="field">
                  <label htmlFor="product-stock-input">Stock actual</label>
                  <input id="product-stock-input" type="number" readOnly value={formState.stock} />
                </div>
                <div className="field">
                  <label htmlFor="product-min-input">Stock minimo</label>
                  <input
                    id="product-min-input"
                    type="number"
                    placeholder="Minimo sugerido"
                    value={formState.minStock}
                    onChange={(e) => setFormState((prev) => ({ ...prev, minStock: e.target.value }))}
                  />
                </div>
                <div className="field">
                  <label htmlFor="product-barcode-input">Codigo de barras</label>
                  <input
                    id="product-barcode-input"
                    type="text"
                    placeholder="Escanea o escribe"
                    value={formState.barcode}
                    onChange={(e) => setFormState((prev) => ({ ...prev, barcode: e.target.value }))}
                  />
                </div>
                <div className="field">
                  <label htmlFor="product-category-input">Categoria</label>
                  <select
                    id="product-category-input"
                    value={formState.category}
                    onChange={(e) => setFormState((prev) => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="Panaderia">Panaderia</option>
                    <option value="Bebidas">Bebidas</option>
                    <option value="Snacks">Snacks</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <p className="section-eyebrow">Impuestos y estado</p>
              <div className="field-grid full">
                <div className="field">
                  <label>Estado</label>
                  <div className="row-actions">
                    <span className="status-chip status-activo">Activo</span>
                    <span className="status-chip status-inactivo">Inactivo</span>
                    <span className="status-chip status-descontinuado">Descontinuado</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button className="btn-primary">Guardar</button>
              <button className="btn-outline">Cancelar</button>
              <button className="btn-danger">Eliminar</button>
            </div>
            <p className="muted">Validaciones: codigo duplicado, precio menor que costo y campos obligatorios.</p>
          </article>
        </aside>
      </div>

      <section className={`movement-card mobile-only ${visiblePanel('movimientos')}`} data-product-panel="movimientos">
        <header className="card-header" style={{ marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>Movimientos recientes</h3>
        </header>
        <div id="movement-list-tab">
          {movements.map((movement) => (
            <div className="movement-row" key={`${movement.id}-mobile`}>
              <div>
                <strong>{movement.product}</strong>
                <div className="muted">
                  {movement.datetime} • {movement.document}
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
    </main>
  );
};

export default ProductsView;
