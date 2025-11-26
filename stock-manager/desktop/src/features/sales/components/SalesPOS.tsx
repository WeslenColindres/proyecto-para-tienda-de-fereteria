
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { DESKTOP_BREAKPOINT, TABLET_BREAKPOINT } from '@/shared/constants/layout';
import { salesApi } from '@/shared/api/sales';
import { ApiError } from '@/shared/api/types';
import { useProductsInventory } from '@/shared/hooks/useProductsInventory';
import type { SaleCartItem, SaleClientInfo, SalePaymentSummary, SaleSearchResult, SaleStatusInfo, SaleDetail } from '@/shared/types/sales';
import type { ProductItem } from '@/shared/types/products';
import { cn } from '@/shared/utils/cn';
import Modal from '@/ui/molecules/Modal/Modal';

type Step = 'busqueda' | 'carrito' | 'cliente' | 'pago';
type ViewMode = 'desktop' | 'tablet' | 'mobile';

const formatMoney = (value: number) =>
  value.toLocaleString('es-GT', { style: 'currency', currency: 'GTQ', minimumFractionDigits: 2, maximumFractionDigits: 2 });

const surface =
  'rounded-3xl border border-white/10 bg-gradient-to-b from-[#050b18] via-[#040713] to-[#010409] p-5 shadow-[0_35px_90px_rgba(3,7,17,0.75)]';
const ghostButton =
  'rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:border-white/5 disabled:text-slate-500';
const labelClass = 'text-xs font-semibold uppercase tracking-[0.35em] text-slate-400';
const inputClass =
  'h-11 rounded-2xl border border-white/10 bg-white/5 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal-400 focus:outline-none focus:ring-0';

const STEP_FLOW: { id: Step; label: string; helper: string }[] = [
  { id: 'busqueda', label: '1. Busqueda de productos', helper: 'Escanea o escribe' },
  { id: 'carrito', label: '2. Carrito de compras', helper: 'Revisa cantidades' },
  { id: 'cliente', label: '3. Datos del cliente', helper: 'Identifica al comprador' },
  { id: 'pago', label: '4. Pago y totales', helper: 'Confirma metodo y cambio' },
];

const SHORTCUTS = [
  { key: '/', action: 'Ir al buscador' },
  { key: 'F2', action: 'Editar cantidad seleccionada' },
  { key: 'F3', action: 'Modificar precio (segun permisos)' },
  { key: 'F4', action: 'Aplicar descuento' },
  { key: 'F5', action: 'Ir al NIT del cliente' },
  { key: 'F12', action: 'Guardar e imprimir' },
  { key: 'Ctrl+Z', action: 'Deshacer ultima accion' },
  { key: 'Ctrl+D', action: 'Duplicar producto' },
];

const calcStockState = (product: ProductItem): SaleSearchResult['stockState'] => {
  if (product.stock <= 0) return 'critical';
  if (product.stock <= (product.minStock || 1)) return 'low';
  return 'ok';
};

const STOCK_PILLS: Record<SaleSearchResult['stockState'], string> = {
  ok: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  low: 'border-amber-400/30 bg-amber-400/10 text-amber-100',
  critical: 'border-rose-400/40 bg-rose-500/10 text-rose-200',
};

const StepFlow = memo(({ activeStep }: { activeStep: Step }) => {
  const currentIndex = STEP_FLOW.findIndex((step) => step.id === activeStep);

  return (
    <nav className={cn(surface, 'flex flex-col gap-2 bg-[#050b18]/80 py-4')}>
      <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">1. Buscar  2. Carrito  3. Cliente  4. Pago</p>
      <ol className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
        {STEP_FLOW.map((step, index) => {
          const state = index < currentIndex ? 'done' : index === currentIndex ? 'active' : 'idle';
          return (
            <li
              key={step.id}
              className={cn(
                'flex flex-1 items-center gap-3 rounded-2xl border px-3 py-2',
                state === 'active'
                  ? 'border-sky-400/60 bg-sky-500/10 text-white shadow-[0_8px_20px_rgba(56,189,248,0.25)]'
                  : state === 'done'
                  ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100'
                  : 'border-white/10 bg-white/5 text-slate-400',
              )}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.35em]">{step.label}</span>
              <span className="text-xs text-slate-400">{step.helper}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
});

const StatusItem = ({ label, value, icon, variant }: { label: string; value: string; icon: string; variant?: 'pill' }) => (
  <div
    className={cn(
      'flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] tracking-[0.35em]',
      variant === 'pill' && 'border-sky-400/50 bg-sky-500/10 text-white',
    )}
  >
    <span className="font-mono text-[10px] text-slate-400">{icon}</span>
    <span>
      {label}: <span className="text-white">{value}</span>
    </span>
  </div>
);

const SaleStatusStrip = memo(({ info }: { info: SaleStatusInfo }) => {
  return (
    <header
      className={cn(
        surface,
        'flex flex-col gap-4 bg-gradient-to-r from-[#152238] via-[#101b2c] to-[#0a0f19] text-xs font-semibold uppercase tracking-[0.35em] text-slate-200 lg:flex-row lg:items-center lg:justify-between',
      )}
    >
      <div className="grid gap-2 text-[11px] sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center lg:gap-4">
        <StatusItem label="Punto de venta" icon="[POS]" value={info.pos} />
        <StatusItem label="Turno actual" icon="[TRN]" value={info.shift} />
        <StatusItem label="Cajero" icon="[USR]" value={info.user} />
        <StatusItem label="Documento actual" icon="[DOC]" value={info.document} variant="pill" />
      </div>
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-slate-300">
        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        Punto de venta  Venta en progreso
      </div>
    </header>
  );
});

const TabletTabs = memo(({ activeStep, onChange }: { activeStep: Step; onChange: (step: Step) => void }) => {
  return (
    <div className={cn(surface, 'sticky top-16 z-20 flex gap-3 bg-[#040713]/95 p-2 backdrop-blur')}>
      {[
        { id: 'busqueda', label: 'Busqueda' },
        { id: 'carrito', label: 'Carrito' },
        { id: 'cliente', label: 'Cliente' },
        { id: 'pago', label: 'Pago' },
      ].map((tab) => (
        <button
          key={tab.id}
          className={cn(
            'flex-1 rounded-2xl border border-white/10 px-3 py-2 text-sm font-semibold transition',
            activeStep === tab.id
              ? 'border-sky-400/60 bg-sky-400/20 text-white shadow-[0_10px_25px_rgba(56,189,248,0.35)]'
              : 'text-slate-400 hover:border-white/30 hover:text-white',
          )}
          onClick={() => onChange(tab.id as Step)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
});

const SearchResultRow = memo(({ item, index, onAddItem }: { item: SaleSearchResult; index: number; onAddItem: () => void }) => (
  <button
    type="button"
    className="grid grid-cols-[1fr_auto_auto_48px] items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:border-sky-400/50"
    onClick={onAddItem}
  >
    <div className="space-y-1">
      <div className="text-base font-semibold text-white">{item.name}</div>
      <div className="text-xs text-slate-400">{item.code}</div>
    </div>
    <div className="text-right">
      <div className="text-lg font-semibold text-white">{formatMoney(item.price)}</div>
      <small className="text-[11px] text-slate-500">Precio</small>
    </div>
    <div className={cn('rounded-2xl border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em]', STOCK_PILLS[item.stockState])}>
      {item.stockState.toUpperCase()}  {item.stock} en stock
    </div>
    <div className="text-right text-xs text-slate-500">{index + 1}</div>
  </button>
));

const SearchPanel = memo(
  ({
    hidden,
    ghost,
    value,
    onChange,
    onClear,
    results,
    onAddItem,
    loading,
    error,
    onRetry,
  }: {
    hidden: boolean;
    ghost: boolean;
    value: string;
    onChange: (value: string) => void;
    onClear: () => void;
    results: SaleSearchResult[];
    onAddItem: (productId: string) => void;
    loading: boolean;
    error: string | null;
    onRetry: () => void;
  }) => {
    return (
      <section className={cn(surface, 'space-y-4', hidden && 'hidden', ghost && 'opacity-70 border-dashed border-white/30')} data-step="busqueda">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className={labelClass}>1. Busqueda de productos</p>
            <h3 className="mt-1 text-2xl font-semibold text-white">Buscar productos</h3>
            <p className="mt-1 text-sm text-slate-400">Escanea o escribe para agregar rapidamente.</p>
          </div>
          <div className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold tracking-[0.35em] text-emerald-200">
            Scanner activo
          </div>
        </header>

        <div className="space-y-2 rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="flex flex-col gap-2 md:flex-row">
            <input
              type="text"
              placeholder="Escanea codigo o escribe nombre / codigo"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 bg-transparent text-lg text-white placeholder:text-slate-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={onClear}
              className="rounded-2xl border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/50"
            >
              Limpiar
            </button>
          </div>
          <p className="text-xs text-slate-500">Enter: agregar primer resultado  Flechas: navegar  +: aumentar cantidad antes de agregar</p>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-100">
            <p>{error}</p>
            <button type="button" className={ghostButton} onClick={onRetry}>
              Reintentar
            </button>
          </div>
        )}

        <div className="grid max-h-64 gap-3 overflow-auto pr-1">
          {loading && <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">Cargando catalogo...</div>}
          {!loading &&
            results.map((item, index) => (
              <SearchResultRow key={item.id} item={item} index={index} onAddItem={() => onAddItem(item.id)} />
            ))}
          {!loading && results.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
              No hay coincidencias. Intenta con otro codigo o nombre.
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1 text-sm text-slate-400 lg:flex-row lg:items-center lg:justify-between">
          <button type="button" className="text-sky-400 transition hover:text-sky-200" onClick={onRetry}>
            Recargar catalogo
          </button>
          <p className="text-xs text-slate-500">Al agregar un producto, se actualiza stock en tiempo real.</p>
        </div>
      </section>
    );
  },
);
const CartRow = memo(
  ({
    item,
    index,
    onQtyChange,
    onPriceChange,
    onRemove,
  }: {
    item: SaleCartItem;
    index: number;
    onQtyChange: (id: string, qty: number) => void;
    onPriceChange: (id: string, price: number) => void;
    onRemove: (id: string) => void;
  }) => (
    <div className="grid grid-cols-[30px_1fr_80px_110px_130px_120px] items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
      <span className="text-sm text-slate-400">{index + 1}</span>
      <div className="space-y-1">
        <div className="text-sm font-semibold text-white">{item.name}</div>
        <small className="text-xs text-slate-500">
          {item.code}  Stock {item.stock}
        </small>
      </div>
      <input
        type="number"
        min={1}
        value={item.qty}
        onChange={(e) => onQtyChange(item.productId, Number(e.target.value))}
        className={cn(inputClass, 'text-center')}
      />
      <input
        type="number"
        min={0}
        value={item.price}
        onChange={(e) => onPriceChange(item.productId, Number(e.target.value))}
        className={cn(inputClass, 'text-right')}
      />
      <span className="text-right text-sm font-semibold text-white">{formatMoney(item.subtotal)}</span>
      <div className="flex justify-end gap-2">
        <button type="button" className={ghostButton} title="Eliminar" onClick={() => onRemove(item.productId)}>
          Eliminar
        </button>
      </div>
    </div>
  ),
);

const CartPanel = memo(
  ({
    hidden,
    ghost,
    items,
    onContinue,
    onQtyChange,
    onPriceChange,
    onRemove,
    onClear,
    onUndo,
  }: {
    hidden: boolean;
    ghost: boolean;
    items: SaleCartItem[];
    onContinue: () => void;
    onQtyChange: (id: string, qty: number) => void;
    onPriceChange: (id: string, price: number) => void;
    onRemove: (id: string) => void;
    onClear: () => void;
    onUndo: () => void;
  }) => {
    const subtitle = items.length === 0 ? 'Sin productos en el carrito' : `${items.length} productos en el carrito`;

    return (
      <section className={cn(surface, 'space-y-4', hidden && 'hidden', ghost && 'opacity-70 border-dashed border-white/30')} data-step="carrito">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className={labelClass}>2. Carrito de compras</p>
            <h3 className="mt-1 text-2xl font-semibold text-white">{subtitle}</h3>
            <p className="text-sm text-slate-400">Ajusta cantidades, precios y verifica stock.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:border-rose-300 hover:text-white"
              onClick={onClear}
            >
              Vaciar carrito
            </button>
            <button type="button" className={ghostButton} title="Ctrl+Z" onClick={onUndo}>
              Deshacer ultima accion
            </button>
          </div>
        </header>

        <div className="space-y-3">
          <div className="grid grid-cols-[30px_1fr_80px_110px_130px_120px] gap-3 text-[11px] uppercase tracking-[0.35em] text-slate-500">
            <span>#</span>
            <span>Producto</span>
            <span>Cant.</span>
            <span>Precio</span>
            <span>Subtotal</span>
            <span>Acciones</span>
          </div>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <CartRow key={item.productId} item={item} index={idx} onQtyChange={onQtyChange} onPriceChange={onPriceChange} onRemove={onRemove} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 text-sm text-slate-400 lg:flex-row lg:items-center lg:justify-between">
          <p>El sistema valida stock disponible en backend. Los cambios se actualizan por WebSocket.</p>
          <button
            type="button"
            className="rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-400 px-5 py-2 text-sm font-semibold text-slate-900 shadow-lg"
            onClick={onContinue}
            disabled={items.length === 0}
          >
            Continuar con cliente
          </button>
        </div>
      </section>
    );
  },
);

const ClientPaymentPanel = memo(
  ({
    hidden,
    ghost,
    client,
    payment,
    onContinue,
    isPaymentStep,
    onClientChange,
    onPaidWithChange,
  }: {
    hidden: boolean;
    ghost: boolean;
    client: SaleClientInfo;
    payment: SalePaymentSummary;
    onContinue: () => void;
    isPaymentStep: boolean;
    onClientChange: (partial: Partial<SaleClientInfo>) => void;
    onPaidWithChange: (value: number) => void;
  }) => {
    const docPill =
      client.documentType === 'FACTURA'
        ? { title: 'Factura a cliente registrado', color: 'text-emerald-300', bg: 'bg-emerald-400/10 border-emerald-400/30' }
        : client.documentType === 'FACTURA_NUEVO'
        ? { title: 'Factura a nuevo cliente', color: 'text-amber-300', bg: 'bg-amber-400/10 border-amber-400/30' }
        : { title: 'Comprobante para consumidor final', color: 'text-slate-300', bg: 'bg-slate-500/10 border-slate-500/30' };

    const changeIsNegative = payment.change < 0;
    const changeLabel = changeIsNegative ? `Falta cobrar ${formatMoney(Math.abs(payment.change))}` : `Cambio ${formatMoney(payment.change)}`;

    return (
      <section className={cn(surface, 'space-y-5', hidden && 'hidden', ghost && 'opacity-70 border-dashed border-white/30')} data-step="cliente">
        <div className="space-y-5">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className={labelClass}>3. Datos del cliente</p>
            <div className="mt-1 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-white">Identifica al cliente y selecciona el tipo de documento</h3>
                <p className="mt-2 text-sm text-slate-400">Verifica NIT y nombre antes de continuar.</p>
              </div>
              <div className={cn('rounded-2xl border px-4 py-3 text-sm font-semibold', docPill.bg, docPill.color)}>{docPill.title}</div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-slate-300">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-500">NIT</span>
                <div className="flex gap-2">
                  <input type="text" value={client.nit} className={inputClass} onChange={(e) => onClientChange({ nit: e.target.value })} />
                  <button type="button" className={ghostButton} onClick={() => onClientChange({ status: 'registrado' })}>
                    Validar
                  </button>
                </div>
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-300">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Nombre</span>
                <input type="text" value={client.name} className={inputClass} onChange={(e) => onClientChange({ name: e.target.value })} />
              </label>
              <label className="flex flex-col gap-2 text-sm text-slate-300">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Telefono</span>
                <input type="text" value={client.phone ?? ''} className={inputClass} onChange={(e) => onClientChange({ phone: e.target.value })} />
              </label>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={ghostButton} onClick={() => onClientChange({ documentType: 'FACTURA_NUEVO' })}>
                  + Nuevo cliente
                </button>
                <button
                  type="button"
                  className="rounded-2xl bg-gradient-to-r from-emerald-400 to-sky-500 px-4 py-2 text-sm font-semibold text-slate-900"
                  onClick={onContinue}
                >
                  Siguiente: pago
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className={labelClass}>Resumen</p>
              <div className="mt-3 space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2 text-sm text-slate-300">
                  <span>Subtotal</span>
                  <strong className="text-white">{formatMoney(payment.subtotal)}</strong>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2 text-sm text-slate-300">
                  <span>Impuestos</span>
                  <strong className="text-white">{formatMoney(payment.tax)}</strong>
                </div>
                <div className="flex items-center justify-between pt-2 text-xl font-semibold text-white">
                  <span>Total</span>
                  <strong>{formatMoney(payment.total)}</strong>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className={labelClass}>{isPaymentStep ? '4. Pago y totales' : 'Pago y totales'}</p>
              <div className="mt-3 space-y-3">
                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Metodo de pago</span>
                  <select
                    className={cn(inputClass, 'bg-[#050b18]')}
                    value={payment.method}
                    onChange={(e) => onClientChange({ message: `Pago con ${e.target.value}` })}
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta">Tarjeta</option>
                    <option value="Transferencia">Transferencia</option>
                  </select>
                </label>

                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Recibido</span>
                  <input
                    type="number"
                    min={0}
                    value={payment.paidWith}
                    onChange={(e) => onPaidWithChange(Number(e.target.value))}
                    className={cn(inputClass, 'text-right')}
                  />
                </label>

                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Cambio</span>
                    <strong className={cn(changeIsNegative ? 'text-amber-200' : 'text-white')}>{changeLabel}</strong>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Sugerencias: {payment.suggestions?.map((s) => formatMoney(s)).join(', ')}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button type="button" className={ghostButton} onClick={() => onPaidWithChange(payment.total)}>
                    Marcar como exacto
                  </button>
                  <button type="button" className={ghostButton} onClick={onContinue}>
                    Continuar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={cn('rounded-3xl border border-white/10 bg-white/5 p-5', isPaymentStep ? 'block' : 'opacity-70')}>
          <p className={labelClass}>4. Guardar</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="rounded-2xl bg-gradient-to-r from-emerald-400 to-sky-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg" onClick={onContinue}>
              Ir a guardar
            </button>
            <button type="button" className={ghostButton}>
              Enviar factura por correo
            </button>
          </div>
        </div>
      </section>
    );
  },
);

const ShortcutsGrid = memo(() => (
  <div className={cn(surface, 'border-dashed border-white/15 bg-gradient-to-r from-[#050b18] via-[#080e1d] to-[#050b18]')}>
    <div className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-400">Atajos rapidos</div>
    <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {SHORTCUTS.map((item) => (
        <div key={item.key} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
          <span className="rounded-xl border border-white/20 bg-black/30 px-2 py-1 text-xs font-semibold tracking-[0.35em]">{item.key}</span>
          <span className="text-slate-300">{item.action}</span>
        </div>
      ))}
    </div>
  </div>
));

const SaleResultModal = ({
  result,
  onClose,
}: {
  result: { sale?: SaleDetail; error?: string } | null;
  onClose: () => void;
}) => {
  if (!result) return null;
  const sale = result.sale;

  return (
    <Modal
      open
      title={sale ? 'Venta guardada' : 'Error al guardar'}
      description={sale ? 'La venta se guardo y el stock se desconto.' : 'No se pudo completar la venta.'}
      onClose={onClose}
      footer={
        <button type="button" className="rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-400 px-4 py-2 text-sm font-semibold text-slate-900" onClick={onClose}>
          Cerrar
        </button>
      }
    >
      {sale ? (
        <div className="space-y-2 text-sm">
          <p className="text-white">
            Documento: <strong>{sale.docNumber}</strong>
          </p>
          <p>Cliente: {sale.clientName}</p>
          <p>Total: {formatMoney(sale.total)}</p>
          <p>Items: {sale.items.length}</p>
        </div>
      ) : (
        <p className="text-sm text-rose-200">{result.error}</p>
      )}
    </Modal>
  );
};
const SalesPOS = () => {
  const [mode, setMode] = useState<ViewMode>('desktop');
  const [activeStep, setActiveStep] = useState<Step>('busqueda');
  const [search, setSearch] = useState('');
  const { products, loading: loadingProducts, error: productsError, reload: reloadProducts } = useProductsInventory();
  const [cartItems, setCartItems] = useState<SaleCartItem[]>([]);
  const [history, setHistory] = useState<SaleCartItem[][]>([]);
  const [client, setClient] = useState<SaleClientInfo>({
    nit: 'CF',
    name: 'Consumidor Final',
    phone: '',
    documentType: 'COMPROBANTE',
    status: 'consumidor-final',
  });
  const [payment, setPayment] = useState<SalePaymentSummary>({
    subtotal: 0,
    tax: 0,
    total: 0,
    paidWith: 0,
    change: 0,
    method: 'Efectivo',
    suggestions: [100, 200, 500],
  });
  const [banner, setBanner] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ sale?: SaleDetail; error?: string } | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= DESKTOP_BREAKPOINT) {
        setMode('desktop');
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

  useEffect(() => {
    setCartItems((prev) =>
      prev.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return item;
        const nextQty = Math.min(item.qty, product.stock);
        return { ...item, stock: product.stock, qty: nextQty, subtotal: nextQty * item.price };
      }),
    );
  }, [products]);

  useEffect(() => {
    const subtotal = cartItems.reduce((acc, item) => acc + item.subtotal, 0);
    const tax = Math.round(subtotal * 0.12 * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;
    setPayment((prev) => {
      const paidWith = prev.paidWith || total;
      const change = Math.round((paidWith - total) * 100) / 100;
      return { ...prev, subtotal, tax, total, paidWith, change };
    });
  }, [cartItems]);

  const statusInfo: SaleStatusInfo = {
    pos: 'Caja 1',
    user: 'POS Desktop',
    shift: 'Turno diurno',
    document: cartItems.length ? `${cartItems.length} productos` : 'Sin documento',
  };

  const searchResults = useMemo(() => {
    const mapped = products
      .filter((p) => p.active !== false)
      .map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        price: p.price,
        stock: p.stock,
        minStock: p.minStock,
        stockState: calcStockState(p),
      }));
    if (!search.trim()) return mapped;
    return mapped.filter((item) => `${item.name} ${item.code}`.toLowerCase().includes(search.trim().toLowerCase()));
  }, [products, search]);

  const pushHistory = useCallback((snapshot: SaleCartItem[]) => {
    setHistory((prev) => [...prev.slice(-9), snapshot]);
  }, []);

  const handleAddItem = useCallback(
    (productId: string) => {
      const product = products.find((p) => p.id === productId);
      if (!product || product.active === false) {
        setBanner('Producto no disponible');
        return;
      }
      if (product.stock <= 0) {
        setBanner('No hay stock disponible');
        return;
      }
      setCartItems((prev) => {
        pushHistory(prev);
        const exists = prev.find((item) => item.productId === productId);
        if (exists) {
          const nextQty = Math.min(exists.qty + 1, product.stock);
          return prev.map((item) =>
            item.productId === productId
              ? { ...item, qty: nextQty, subtotal: nextQty * item.price, stock: product.stock }
              : item,
          );
        }
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            code: product.code,
            qty: 1,
            price: product.price,
            subtotal: product.price,
            stock: product.stock,
            discountPct: 0,
          },
        ];
      });
      setActiveStep('carrito');
      setBanner(null);
    },
    [products, pushHistory],
  );

  const handleQtyChange = useCallback(
    (id: string, qty: number) => {
      if (qty <= 0) return;
      setCartItems((prev) => {
        pushHistory(prev);
        return prev.map((item) => {
          if (item.productId !== id) return item;
          const available = item.stock ?? qty;
          const cappedQty = Math.max(1, Math.min(qty, available));
          return { ...item, qty: cappedQty, subtotal: cappedQty * item.price };
        });
      });
    },
    [pushHistory],
  );

  const handlePriceChange = useCallback(
    (id: string, price: number) => {
      if (price < 0) return;
      setCartItems((prev) => {
        pushHistory(prev);
        return prev.map((item) => {
          if (item.productId !== id) return item;
          const safePrice = Math.round(price * 100) / 100;
          return { ...item, price: safePrice, subtotal: safePrice * item.qty };
        });
      });
    },
    [pushHistory],
  );

  const handleRemove = useCallback(
    (id: string) => {
      setCartItems((prev) => {
        pushHistory(prev);
        return prev.filter((item) => item.productId !== id);
      });
    },
    [pushHistory],
  );
  const handleClearCart = useCallback(() => {
    pushHistory(cartItems);
    setCartItems([]);
  }, [cartItems, pushHistory]);

  const handleUndo = useCallback(() => {
    setHistory((prev) => {
      const last = prev[prev.length - 1];
      if (!last) return prev;
      setCartItems(last);
      return prev.slice(0, -1);
    });
  }, []);

  const handleSearchChange = useCallback((value: string) => setSearch(value), []);
  const handleSearchClear = useCallback(() => setSearch(''), []);
  const handleCartContinue = useCallback(() => setActiveStep('cliente'), []);
  const handleClientContinue = useCallback(() => setActiveStep('pago'), []);
  const handleClientChange = useCallback((partial: Partial<SaleClientInfo>) => {
    setClient((prev) => ({ ...prev, ...partial }));
  }, []);
  const handlePaidWithChange = useCallback((value: number) => {
    setPayment((prev) => {
      const paidWith = Number.isFinite(value) ? value : prev.paidWith;
      const change = Math.round((paidWith - prev.total) * 100) / 100;
      return { ...prev, paidWith, change };
    });
  }, []);

  const handleSubmitSale = useCallback(
    async (mode: 'print' | 'save') => {
      if (cartItems.length === 0) {
        setBanner('El carrito esta vacio');
        return;
      }
      setSubmitting(true);
      setBanner(null);
      try {
        const payload = {
          docType: client.documentType,
          clientName: client.name || 'Consumidor Final',
          clientNit: client.nit || 'CF',
          user: 'cajero01',
          items: cartItems.map((item) => ({ productId: item.productId, qty: item.qty, price: item.price })),
        };
        const sale = await salesApi.create(payload);
        setResult({ sale });
        setCartItems([]);
        setActiveStep('busqueda');
        setSearch('');
        reloadProducts();
        if (mode === 'print') {
          console.info('Imprimir ticket', sale.docNumber);
        }
      } catch (err) {
        const message =
          err instanceof ApiError
            ? `${err.code ?? 'ERROR'}: ${err.message}`
            : 'No se pudo guardar la venta. Revisa la conexion.';
        setResult({ error: message });
      } finally {
        setSubmitting(false);
      }
    },
    [cartItems, client.documentType, client.name, client.nit, reloadProducts],
  );

  const gridClass = mode === 'mobile' ? 'flex flex-col gap-4' : 'grid gap-4';
  const gridStyle = mode === 'desktop' ? { gridTemplateColumns: '1.3fr 1fr 0.9fr' } : undefined;

  return (
    <section className="flex flex-col gap-4 text-slate-100" data-tailwind-view="sales-pos">
      <SaleStatusStrip info={statusInfo} />
      <StepFlow activeStep={activeStep} />

      {mode === 'tablet' && <TabletTabs activeStep={activeStep} onChange={setActiveStep} />}

      {banner && <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">{banner}</div>}

      <div className={gridClass} style={gridStyle}>
        <SearchPanel
          hidden={mode === 'tablet' && activeStep !== 'busqueda'}
          ghost={mode === 'mobile' && activeStep !== 'busqueda'}
          value={search}
          onChange={handleSearchChange}
          onClear={handleSearchClear}
          results={searchResults}
          onAddItem={handleAddItem}
          loading={loadingProducts}
          error={productsError}
          onRetry={reloadProducts}
        />

        <CartPanel
          hidden={mode === 'tablet' && activeStep !== 'carrito'}
          ghost={mode === 'mobile' && activeStep !== 'carrito'}
          items={cartItems}
          onContinue={handleCartContinue}
          onQtyChange={handleQtyChange}
          onPriceChange={handlePriceChange}
          onRemove={handleRemove}
          onClear={handleClearCart}
          onUndo={handleUndo}
        />

        <ClientPaymentPanel
          hidden={mode === 'tablet' && activeStep !== 'cliente' && activeStep !== 'pago'}
          ghost={mode === 'mobile' && activeStep === 'busqueda'}
          client={client}
          payment={payment}
          isPaymentStep={activeStep === 'pago'}
          onContinue={handleClientContinue}
          onClientChange={handleClientChange}
          onPaidWithChange={handlePaidWithChange}
        />
      </div>

      <div className={cn(surface, 'flex flex-wrap gap-2 bg-white/5')}>
        <button
          type="button"
          className="rounded-2xl bg-gradient-to-r from-emerald-400 to-sky-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg"
          onClick={() => handleSubmitSale('print')}
          disabled={cartItems.length === 0 || submitting}
        >
          Guardar e imprimir
        </button>
        <button type="button" className={ghostButton} onClick={() => handleSubmitSale('save')} disabled={cartItems.length === 0 || submitting}>
          Solo guardar
        </button>
        <button type="button" className={ghostButton} onClick={() => setBanner('Envio por correo pendiente de configuracion')}>
          Enviar por correo
        </button>
        <button type="button" className={ghostButton} onClick={() => setBanner('Envio por WhatsApp pendiente de configuracion')}>
          Enviar por WhatsApp
        </button>
      </div>

      <ShortcutsGrid />
      <SaleResultModal result={result} onClose={() => setResult(null)} />
    </section>
  );
};

export default SalesPOS;
