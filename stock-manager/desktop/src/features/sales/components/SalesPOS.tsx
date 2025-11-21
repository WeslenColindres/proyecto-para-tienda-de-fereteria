import { useEffect, useMemo, useState } from 'react';
import { DESKTOP_BREAKPOINT, TABLET_BREAKPOINT } from '@/shared/constants/layout';
import { PDV_CART_ITEMS, PDV_CLIENT_INFO, PDV_PAYMENT_SUMMARY, PDV_SEARCH_RESULTS, SALE_STATUS_BAR } from '@/shared/data/sales';
import type { SaleCartItem, SaleClientInfo, SalePaymentSummary, SaleSearchResult, SaleStatusInfo } from '@/shared/types/sales';

type Step = 'busqueda' | 'carrito' | 'cliente' | 'pago';
type ViewMode = 'desktop' | 'tablet' | 'mobile';

const formatMoney = (value: number) =>
  value.toLocaleString('es-GT', { style: 'currency', currency: 'GTQ', minimumFractionDigits: 2, maximumFractionDigits: 2 });

const SalesPOS = () => {
  const [mode, setMode] = useState<ViewMode>('desktop');
  const [activeStep, setActiveStep] = useState<Step>('busqueda');
  const [search, setSearch] = useState('');
  const [cartItems] = useState<SaleCartItem[]>(PDV_CART_ITEMS);
  const [client] = useState<SaleClientInfo>(PDV_CLIENT_INFO);
  const [payment] = useState<SalePaymentSummary>(PDV_PAYMENT_SUMMARY);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= DESKTOP_BREAKPOINT) {
        setMode('desktop');
        setActiveStep('busqueda');
      } else if (width >= TABLET_BREAKPOINT) {
        setMode('tablet');
      } else {
        setMode('mobile');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredResults = useMemo(() => {
    if (!search.trim()) return PDV_SEARCH_RESULTS;
    return PDV_SEARCH_RESULTS.filter((item) => {
      const haystack = `${item.name} ${item.code}`.toLowerCase();
      return haystack.includes(search.trim().toLowerCase());
    });
  }, [search]);

  const goToStep = (next: Step) => {
    if (mode === 'desktop') return;
    setActiveStep(next);
  };

  return (
    <section className="sales-pos">
      <SaleStatusStrip info={SALE_STATUS_BAR} />

      {mode === 'tablet' && <TabletTabs activeStep={activeStep} onChange={setActiveStep} />}

      <div className={`sales-grid mode-${mode}`}>
        <SearchPanel
          hidden={mode === 'tablet' && activeStep !== 'busqueda'}
          ghost={mode === 'mobile' && activeStep !== 'busqueda'}
          value={search}
          onChange={setSearch}
          results={filteredResults}
          onAddItem={() => goToStep('carrito')}
        />

        <CartPanel
          hidden={mode === 'tablet' && activeStep !== 'carrito'}
          ghost={mode === 'mobile' && activeStep !== 'carrito'}
          items={cartItems}
          onContinue={() => goToStep('cliente')}
        />

        <ClientPaymentPanel
          hidden={mode === 'tablet' && activeStep !== 'cliente' && activeStep !== 'pago'}
          ghost={mode === 'mobile' && activeStep === 'busqueda'}
          client={client}
          payment={payment}
          onContinue={() => goToStep('pago')}
        />
      </div>

      <div className="sales-shortcuts card">
        <div className="shortcuts-title">Atajos rapidos</div>
        <div className="shortcuts-grid">
          {[
            { key: '/', action: 'Focus buscar producto' },
            { key: 'F2', action: 'Cambiar cantidad seleccionada' },
            { key: 'F3', action: 'Cambiar precio (segun permisos)' },
            { key: 'F4', action: 'Aplicar descuento' },
            { key: 'F5', action: 'Focus NIT cliente' },
            { key: 'F12', action: 'Guardar e imprimir' },
            { key: 'Ctrl+Z', action: 'Deshacer ultima accion' },
            { key: 'Ctrl+D', action: 'Duplicar item' }
          ].map((item) => (
            <div key={item.key} className="shortcut-chip">
              <span className="key">{item.key}</span>
              <span className="action">{item.action}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SalesPOS;

const SaleStatusStrip = ({ info }: { info: SaleStatusInfo }) => {
  return (
    <header className="sale-status-bar card">
      <div className="status-item">
        POS: <strong>{info.pos}</strong>
      </div>
      <div className="status-item">
        Usuario: <strong>{info.user}</strong>
      </div>
      <div className="status-item">
        Turno: <strong>{info.shift}</strong>
      </div>
      <div className="status-item pill">Doc: {info.document}</div>
    </header>
  );
};

const TabletTabs = ({ activeStep, onChange }: { activeStep: Step; onChange: (step: Step) => void }) => {
  return (
    <div className="sales-tabs card">
      {[
        { id: 'busqueda', label: 'Busqueda' },
        { id: 'carrito', label: 'Carrito' },
        { id: 'cliente', label: 'Cliente' },
        { id: 'pago', label: 'Pago' }
      ].map((tab) => (
        <button
          key={tab.id}
          className={activeStep === tab.id ? 'active' : ''}
          onClick={() => onChange(tab.id as Step)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

const SearchPanel = ({
  hidden,
  ghost,
  value,
  onChange,
  results,
  onAddItem
}: {
  hidden: boolean;
  ghost: boolean;
  value: string;
  onChange: (value: string) => void;
  results: SaleSearchResult[];
  onAddItem: () => void;
}) => {
  const stockBadge = (state: SaleSearchResult['stockState']) => {
    if (state === 'critical') return 'CRIT';
    if (state === 'low') return 'LOW';
    return 'OK';
  };

  return (
    <section className={`sales-panel search-panel ${hidden ? 'is-hidden' : ''} ${ghost ? 'is-ghost' : ''}`} data-step="busqueda">
      <div className="panel-header">
        <div>
          <p className="eyebrow">1. Busqueda de productos</p>
          <h3>Escanea o escribe para agregar</h3>
        </div>
        <div className="status-pill success">Scanner activo</div>
      </div>

      <div className="search-input">
        <span className="icon">SRCH</span>
        <input
          type="text"
          placeholder="Codigo/nombre/escaner..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button type="button" className="ghost-btn">
          *
        </button>
      </div>

      <div className="search-hints">
        <span>Enter agrega primer resultado</span>
        <span>Flechas navegan resultados</span>
        <span>+ incrementa cantidad antes de agregar</span>
      </div>

      <div className="search-results">
        {results.map((item, index) => (
          <button key={item.id} type="button" className="result-card" onClick={onAddItem}>
            <div className="result-main">
              <div className="result-name">{item.name}</div>
              <div className="result-code">{item.code}</div>
            </div>
            <div className="result-price">{formatMoney(item.price)}</div>
            <div className={`result-stock state-${item.stockState}`}>Stock: {item.stock} · {stockBadge(item.stockState)}</div>
            <div className="result-shortcut">{index + 1}</div>
          </button>
        ))}
      </div>

      <div className="search-footer">
        <button type="button" className="link-btn">
          + Mas resultados
        </button>
        <div className="stock-footnote">
          Stock disponible: Cafe Espresso 15, Pan Frances 8, Empanada 25
          <small>Beep visual/sonoro al agregar</small>
        </div>
      </div>
    </section>
  );
};

const CartPanel = ({
  hidden,
  ghost,
  items,
  onContinue
}: {
  hidden: boolean;
  ghost: boolean;
  items: SaleCartItem[];
  onContinue: () => void;
}) => {
  return (
    <section className={`sales-panel cart-panel ${hidden ? 'is-hidden' : ''} ${ghost ? 'is-ghost' : ''}`} data-step="carrito">
      <div className="panel-header">
        <div>
          <p className="eyebrow">2. Carrito de compras</p>
          <h3>{items.length} items agregados</h3>
        </div>
        <div className="cart-actions">
          <button type="button" className="ghost-btn">
            Vaciar
          </button>
          <button type="button" className="ghost-btn" title="Ctrl+Z">
            Deshacer
          </button>
        </div>
      </div>

      <div className="cart-table">
        <div className="cart-head">
          <span>#</span>
          <span>Producto</span>
          <span>Cant</span>
          <span>Precio</span>
          <span>Desc</span>
          <span>Subtotal</span>
          <span>Acciones</span>
        </div>
        {items.map((item, idx) => (
          <div key={item.id} className="cart-row">
            <span>{idx + 1}</span>
            <div className="cart-name">
              <strong>{item.name}</strong>
              <small>{item.code}</small>
            </div>
            <input type="number" min={1} defaultValue={item.qty} />
            <input type="number" min={0} defaultValue={item.price} />
            <div className="discount-cell">
              <input type="number" min={0} defaultValue={item.discountPct} />
              <span className="muted">%</span>
            </div>
            <span className="subtotal">{formatMoney(item.subtotal)}</span>
            <div className="row-actions">
              <button type="button" className="ghost-btn" title="Editar">
                Editar
              </button>
              <button type="button" className="ghost-btn" title="Eliminar">
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-foot">
        <div className="muted">Validaciones: stock, precio minimo y descuentos por rol.</div>
        <button type="button" className="primary ghost" onClick={onContinue}>
          Continuar con cliente →
        </button>
      </div>
    </section>
  );
};

const ClientPaymentPanel = ({
  hidden,
  ghost,
  client,
  payment,
  onContinue
}: {
  hidden: boolean;
  ghost: boolean;
  client: SaleClientInfo;
  payment: SalePaymentSummary;
  onContinue: () => void;
}) => {
  const typeState =
    client.documentType === 'FACTURA'
      ? { label: '[FACTURA]', color: '#27ae60', bg: '#123524', message: 'Cliente registrado' }
      : client.documentType === 'FACTURA_NUEVO'
      ? { label: '[FACTURA NUEVO]', color: '#f39c12', bg: '#2f2308', message: 'Cliente nuevo - registrar datos' }
      : { label: '[COMPROBANTE]', color: '#95a5a6', bg: '#1f2b32', message: 'Consumidor final' };

  return (
    <section className={`sales-panel client-panel ${hidden ? 'is-hidden' : ''} ${ghost ? 'is-ghost' : ''}`} data-step="cliente">
      <div className="panel-header">
        <div>
          <p className="eyebrow">3. Datos del cliente y totales</p>
          <h3>Identifica al cliente y confirma el tipo de documento</h3>
        </div>
        <div className="doc-pill" style={{ color: typeState.color, background: typeState.bg }}>
          <div className="doc-label">{typeState.label}</div>
          <small>{typeState.message}</small>
        </div>
      </div>

      <div className="client-form">
        <label className="input-control">
          <span>NIT</span>
          <div className="nit-row">
            <input type="text" defaultValue={client.nit} />
            <button type="button" className="ghost-btn">
              Buscar
            </button>
          </div>
        </label>
        <label className="input-control">
          <span>Nombre</span>
          <input type="text" defaultValue={client.name} />
        </label>
        <label className="input-control">
          <span>Telefono</span>
          <input type="text" defaultValue={client.phone} />
        </label>
        <div className="client-actions">
          <button type="button" className="ghost-btn">
            + Nuevo cliente
          </button>
          <button type="button" className="ghost-btn" onClick={onContinue}>
            Continuar a pago →
          </button>
        </div>
      </div>

      <p className="eyebrow">4. Pago y totales</p>
      <div className="payment-summary" data-step="pago">
        <div className="summary-block">
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{formatMoney(payment.subtotal)}</strong>
          </div>
          <div className="summary-row">
            <span>Impuestos</span>
            <strong>{formatMoney(payment.tax)}</strong>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <strong>{formatMoney(payment.total)}</strong>
          </div>
        </div>

        <div className="payment-block">
          <label className="input-control">
            <span>Metodo de pago</span>
            <select defaultValue={payment.method}>
              <option>Efectivo</option>
              <option>Tarjeta</option>
              <option>Transferencia</option>
              <option>Credito</option>
              <option>Mixto</option>
            </select>
          </label>
          <label className="input-control">
            <span>Monto recibido</span>
            <input type="number" defaultValue={payment.paidWith} />
          </label>
          <div className="change-row">
            <span>Cambio</span>
            <strong className={payment.change < 0 ? 'danger' : ''}>{formatMoney(payment.change)}</strong>
          </div>

          <div className="suggestions">
            {payment.suggestions.map((value) => (
              <button key={value} type="button" className="ghost-btn">
                {formatMoney(value)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pos-actions">
        <button type="button" className="primary">
          Guardar e imprimir
        </button>
        <button type="button" className="ghost-btn">
          Enviar email
        </button>
        <button type="button" className="ghost-btn">
          Enviar WhatsApp
        </button>
        <button type="button" className="ghost-btn" disabled>
          Solo guardar
        </button>
      </div>
    </section>
  );
};
