import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { DESKTOP_BREAKPOINT, TABLET_BREAKPOINT } from '@/shared/constants/layout';
import { salesApi } from '@/shared/api/sales';
import { ApiError } from '@/shared/api/types';
import { useProductsInventory } from '@/shared/hooks/useProductsInventory';
import type { SaleCartItem, SaleClientInfo, SalePaymentSummary, SaleSearchResult, SaleStatusInfo, SaleDetail } from '@/shared/types/sales';
import type { ProductItem } from '@/shared/types/products';
import { cn } from '@/shared/utils/cn';
import Modal from '@/ui/molecules/Modal/Modal';
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  UserIcon,
  CurrencyDollarIcon,
  QrCodeIcon,
  TrashIcon,
  ArrowPathIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

type Step = 'busqueda' | 'carrito' | 'cliente' | 'pago';
type ViewMode = 'desktop' | 'tablet' | 'mobile';

const formatMoney = (value: number) =>
  value.toLocaleString('es-GT', { style: 'currency', currency: 'GTQ', minimumFractionDigits: 2, maximumFractionDigits: 2 });

// --- Design Tokens & Styles ---
const surface =
  'rounded-2xl border border-white/5 bg-[#0b1121]/80 backdrop-blur-xl shadow-2xl ring-1 ring-white/5';

const inputBase =
  'h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200';

const btnBase =
  'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';

const btnPrimary = cn(btnBase, 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30');
const btnSecondary = cn(btnBase, 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5 hover:border-white/10');
const btnDanger = cn(btnBase, 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20');
const btnGhost = cn(btnBase, 'text-slate-400 hover:text-white hover:bg-white/5');

const labelClass = 'text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block';

const STEP_FLOW: { id: Step; label: string; icon: any }[] = [
  { id: 'busqueda', label: 'Catálogo', icon: MagnifyingGlassIcon },
  { id: 'carrito', label: 'Carrito', icon: ShoppingCartIcon },
  { id: 'cliente', label: 'Cliente', icon: UserIcon },
  { id: 'pago', label: 'Pago', icon: CurrencyDollarIcon },
];

const SHORTCUTS = [
  { key: '/', action: 'Buscar' },
  { key: 'F2', action: 'Editar Cant.' },
  { key: 'F3', action: 'Precio' },
  { key: 'F4', action: 'Desc.' },
  { key: 'F5', action: 'NIT' },
  { key: 'F12', action: 'Cobrar' },
  { key: 'Esc', action: 'Cancelar' },
];

const calcStockState = (product: ProductItem): SaleSearchResult['stockState'] => {
  if (product.stock <= 0) return 'critical';
  if (product.stock <= (product.minStock || 1)) return 'low';
  return 'ok';
};

const STOCK_STYLES: Record<SaleSearchResult['stockState'], string> = {
  ok: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  low: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  critical: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

// --- Components ---

const StepFlow = memo(({ activeStep }: { activeStep: Step }) => {
  const currentIndex = STEP_FLOW.findIndex((step) => step.id === activeStep);

  return (
    <nav className="flex items-center gap-2 p-1 rounded-2xl bg-black/20 border border-white/5 overflow-x-auto">
      {STEP_FLOW.map((step, index) => {
        const isActive = index === currentIndex;
        const isDone = index < currentIndex;
        const Icon = step.icon;

        return (
          <div
            key={step.id}
            className={cn(
              'flex flex-1 items-center justify-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 min-w-[140px]',
              isActive
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                : isDone
                  ? 'bg-white/5 text-indigo-200'
                  : 'text-slate-600'
            )}
          >
            <div className={cn(
              "p-1.5 rounded-lg",
              isActive ? "bg-white/20" : isDone ? "bg-indigo-500/20" : "bg-white/5"
            )}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[10px] uppercase tracking-wider opacity-70">Paso {index + 1}</span>
              <span className="text-sm font-bold">{step.label}</span>
            </div>
            {isDone && <CheckCircleIcon className="w-4 h-4 ml-auto text-indigo-400" />}
          </div>
        );
      })}
    </nav>
  );
});

const StatusItem = ({ label, value, icon: Icon }: { label: string; value: string; icon: any }) => (
  <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
    <Icon className="w-3.5 h-3.5 text-slate-400" />
    <div className="flex flex-col leading-none">
      <span className="text-[9px] uppercase tracking-wider text-slate-500">{label}</span>
      <span className="text-xs font-medium text-slate-200">{value}</span>
    </div>
  </div>
);

const SaleStatusStrip = memo(({ info }: { info: SaleStatusInfo }) => {
  return (
    <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-1">
      <div className="flex flex-wrap items-center gap-2">
        <StatusItem label="Caja" value={info.pos} icon={QrCodeIcon} />
        <StatusItem label="Turno" value={info.shift} icon={ArrowPathIcon} />
        <StatusItem label="Cajero" value={info.user} icon={UserIcon} />
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Sistema en línea</span>
      </div>
    </header>
  );
});

const SearchResultRow = memo(({ item, index, onAddItem }: { item: SaleSearchResult; index: number; onAddItem: () => void }) => (
  <button
    type="button"
    className="group relative grid grid-cols-[auto_1fr_auto] items-center gap-4 w-full p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all duration-200 text-left"
    onClick={onAddItem}
  >
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-xs font-bold text-slate-500 group-hover:bg-indigo-500/20 group-hover:text-indigo-300 transition-colors">
      {index + 1}
    </div>

    <div className="min-w-0">
      <div className="flex items-center gap-2 mb-0.5">
        <span className="font-medium text-slate-200 truncate">{item.name}</span>
        <span className={cn("text-[10px] px-1.5 py-0.5 rounded border uppercase font-bold tracking-wider", STOCK_STYLES[item.stockState])}>
          {item.stock}
        </span>
      </div>
      <div className="text-xs text-slate-500 font-mono">{item.code}</div>
    </div>

    <div className="text-right">
      <div className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
        {formatMoney(item.price)}
      </div>
    </div>
  </button>
));

const SearchPanel = memo(
  ({
    hidden,
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
    value: string;
    onChange: (value: string) => void;
    onClear: () => void;
    results: SaleSearchResult[];
    onAddItem: (productId: string) => void;
    loading: boolean;
    error: string | null;
    onRetry: () => void;
  }) => {
    if (hidden) return null;

    return (
      <section className={cn(surface, 'flex flex-col h-full overflow-hidden')} data-step="busqueda">
        <div className="p-5 border-b border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <MagnifyingGlassIcon className="w-5 h-5 text-indigo-400" />
              Buscar Productos
            </h3>
            <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-md border border-white/5">
              {results.length} resultados
            </span>
          </div>

          <div className="relative group">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              autoFocus
              placeholder="Buscar por nombre, código o escáner..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={cn(inputBase, "pl-11 pr-20 h-14 text-lg")}
            />
            {value && (
              <button
                onClick={onClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-500 hover:bg-white/10 hover:text-white transition-colors"
              >
                <span className="text-xs font-bold uppercase">Limpiar</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-slate-500">
              <ArrowPathIcon className="w-6 h-6 animate-spin" />
              <p className="text-sm">Buscando productos...</p>
            </div>
          ) : error ? (
            <div className="m-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center space-y-3">
              <p className="text-sm text-rose-300">{error}</p>
              <button onClick={onRetry} className={btnSecondary}>Reintentar</button>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-slate-600">
              <MagnifyingGlassIcon className="w-8 h-8 opacity-20" />
              <p className="text-sm">No se encontraron productos</p>
            </div>
          ) : (
            results.map((item, index) => (
              <SearchResultRow key={item.id} item={item} index={index} onAddItem={() => onAddItem(item.id)} />
            ))
          )}
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
    <div className="group grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-xs font-bold text-slate-500">
        {index + 1}
      </div>

      <div className="min-w-0">
        <div className="font-medium text-slate-200 truncate">{item.name}</div>
        <div className="text-xs text-slate-500 font-mono mt-0.5">{item.code}</div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex flex-col items-end gap-1">
          <span className="text-[9px] uppercase tracking-wider text-slate-600">Cant.</span>
          <input
            type="number"
            min={1}
            value={item.qty}
            onChange={(e) => onQtyChange(item.productId, Number(e.target.value))}
            className="w-16 h-8 rounded-lg bg-black/20 border border-white/10 text-center text-sm text-white focus:border-indigo-500/50 focus:outline-none"
          />
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="text-[9px] uppercase tracking-wider text-slate-600">Precio</span>
          <input
            type="number"
            min={0}
            value={item.price}
            onChange={(e) => onPriceChange(item.productId, Number(e.target.value))}
            className="w-20 h-8 rounded-lg bg-black/20 border border-white/10 text-right px-2 text-sm text-white focus:border-indigo-500/50 focus:outline-none"
          />
        </div>
      </div>

      <div className="text-right min-w-[80px]">
        <div className="text-sm font-bold text-white">{formatMoney(item.subtotal)}</div>
      </div>

      <button
        onClick={() => onRemove(item.productId)}
        className="p-2 rounded-lg text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
      >
        <TrashIcon className="w-4 h-4" />
      </button>
    </div>
  ),
);

const CartPanel = memo(
  ({
    hidden,
    items,
    onContinue,
    onQtyChange,
    onPriceChange,
    onRemove,
    onClear,
  }: {
    hidden: boolean;
    items: SaleCartItem[];
    onContinue: () => void;
    onQtyChange: (id: string, qty: number) => void;
    onPriceChange: (id: string, price: number) => void;
    onRemove: (id: string) => void;
    onClear: () => void;
  }) => {
    if (hidden) return null;

    const total = items.reduce((acc, item) => acc + item.subtotal, 0);

    return (
      <section className={cn(surface, 'flex flex-col h-full overflow-hidden')} data-step="carrito">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <ShoppingCartIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Carrito</h3>
              <p className="text-xs text-slate-500">{items.length} items</p>
            </div>
          </div>

          {items.length > 0 && (
            <button onClick={onClear} className={cn(btnGhost, "text-xs px-3 py-1.5 h-auto")}>
              Vaciar
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-600">
              <ShoppingCartIcon className="w-12 h-12 opacity-20" />
              <p className="text-sm">El carrito está vacío</p>
            </div>
          ) : (
            items.map((item, idx) => (
              <CartRow key={item.productId} item={item} index={idx} onQtyChange={onQtyChange} onPriceChange={onPriceChange} onRemove={onRemove} />
            ))
          )}
        </div>

        <div className="p-5 bg-black/20 border-t border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Total Estimado</span>
            <span className="text-2xl font-bold text-white tracking-tight">{formatMoney(total)}</span>
          </div>

          <button
            onClick={onContinue}
            disabled={items.length === 0}
            className={cn(btnPrimary, "w-full py-3 text-base")}
          >
            Continuar a Pago
          </button>
        </div>
      </section>
    );
  },
);

const ClientPaymentPanel = memo(
  ({
    hidden,
    client,
    payment,
    onContinue,
    isPaymentStep,
    onClientChange,
    onPaidWithChange,
  }: {
    hidden: boolean;
    client: SaleClientInfo;
    payment: SalePaymentSummary;
    onContinue: () => void;
    isPaymentStep: boolean;
    onClientChange: (partial: Partial<SaleClientInfo>) => void;
    onPaidWithChange: (value: number) => void;
  }) => {
    if (hidden) return null;

    return (
      <section className={cn(surface, 'flex flex-col h-full overflow-hidden')} data-step="cliente">
        <div className="p-5 border-b border-white/5">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-indigo-400" />
            {isPaymentStep ? 'Pago y Finalización' : 'Datos del Cliente'}
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
          {/* Client Section */}
          <div className={cn("space-y-4 transition-opacity duration-300", isPaymentStep && "opacity-50 pointer-events-none")}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={labelClass}>NIT / DPI</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={client.nit}
                    onChange={(e) => onClientChange({ nit: e.target.value })}
                    className={inputBase}
                  />
                  <button onClick={() => onClientChange({ status: 'registrado' })} className={btnSecondary}>
                    <MagnifyingGlassIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Teléfono</label>
                <input
                  type="text"
                  value={client.phone ?? ''}
                  onChange={(e) => onClientChange({ phone: e.target.value })}
                  className={inputBase}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Nombre Completo</label>
              <input
                type="text"
                value={client.name}
                onChange={(e) => onClientChange({ name: e.target.value })}
                className={inputBase}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => onClientChange({ documentType: 'FACTURA' })} className={cn(btnSecondary, "flex-1 text-xs", client.documentType === 'FACTURA' && "bg-indigo-600 text-white border-transparent")}>
                Factura
              </button>
              <button onClick={() => onClientChange({ documentType: 'COMPROBANTE' })} className={cn(btnSecondary, "flex-1 text-xs", client.documentType === 'COMPROBANTE' && "bg-indigo-600 text-white border-transparent")}>
                Comprobante
              </button>
            </div>
          </div>

          {/* Payment Section */}
          {isPaymentStep && (
            <div className="space-y-6 pt-6 border-t border-white/5 animate-in slide-in-from-bottom-4 fade-in duration-300">
              <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="text-white">{formatMoney(payment.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Impuestos</span>
                  <span className="text-white">{formatMoney(payment.tax)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t border-white/10">
                  <span className="text-white">Total a Pagar</span>
                  <span className="text-emerald-400">{formatMoney(payment.total)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className={labelClass}>Método de Pago</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Efectivo', 'Tarjeta', 'Transferencia'].map((m) => (
                      <button
                        key={m}
                        onClick={() => onClientChange({ message: `Pago con ${m}` })}
                        className={cn(
                          btnSecondary,
                          "text-xs py-3",
                          payment.method === m && "bg-indigo-600 text-white border-transparent ring-2 ring-indigo-500/20"
                        )}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={labelClass}>Monto Recibido</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">Q</span>
                    <input
                      type="number"
                      value={payment.paidWith}
                      onChange={(e) => onPaidWithChange(Number(e.target.value))}
                      className={cn(inputBase, "pl-10 text-xl font-bold tracking-wide")}
                    />
                  </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2">
                  {payment.suggestions?.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => onPaidWithChange(amount)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-slate-300 hover:bg-white/10 hover:border-white/10 whitespace-nowrap"
                    >
                      {formatMoney(amount)}
                    </button>
                  ))}
                  <button
                    onClick={() => onPaidWithChange(payment.total)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 hover:bg-indigo-500/20 whitespace-nowrap"
                  >
                    Exacto
                  </button>
                </div>

                <div className={cn(
                  "p-4 rounded-xl border text-center transition-colors",
                  payment.change < 0
                    ? "bg-rose-500/10 border-rose-500/20"
                    : "bg-emerald-500/10 border-emerald-500/20"
                )}>
                  <span className={cn(
                    "text-xs font-bold uppercase tracking-wider block mb-1",
                    payment.change < 0 ? "text-rose-400" : "text-emerald-400"
                  )}>
                    {payment.change < 0 ? "Faltante" : "Cambio"}
                  </span>
                  <span className={cn(
                    "text-2xl font-bold",
                    payment.change < 0 ? "text-rose-200" : "text-emerald-200"
                  )}>
                    {formatMoney(Math.abs(payment.change))}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-5 bg-black/20 border-t border-white/5">
          {!isPaymentStep ? (
            <button onClick={onContinue} className={cn(btnPrimary, "w-full py-3")}>
              Continuar a Pago
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button onClick={onContinue} className={cn(btnPrimary, "col-span-2 py-3 bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20")}>
                Confirmar Venta
              </button>
            </div>
          )}
        </div>
      </section>
    );
  },
);

const ShortcutsGrid = memo(() => (
  <div className="flex flex-wrap gap-2 justify-center py-4 opacity-50 hover:opacity-100 transition-opacity">
    {SHORTCUTS.map((item) => (
      <div key={item.key} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs">
        <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono font-bold text-slate-300">{item.key}</kbd>
        <span className="text-slate-500">{item.action}</span>
      </div>
    ))}
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
      title={sale ? '¡Venta Exitosa!' : 'Error'}
      description={sale ? 'La transacción se ha procesado correctamente.' : 'Hubo un problema al procesar la venta.'}
      onClose={onClose}
      footer={
        <button onClick={onClose} className={cn(btnPrimary, "w-full")}>
          Cerrar
        </button>
      }
    >
      {sale ? (
        <div className="text-center space-y-4 py-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <p className="text-slate-400 text-sm">Documento Generado</p>
            <p className="text-2xl font-bold text-white">{sale.docNumber}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Cliente</span>
              <span className="text-white font-medium">{sale.clientName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Total Cobrado</span>
              <span className="text-emerald-400 font-bold">{formatMoney(sale.total)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-sm text-center">
          {result.error}
        </div>
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
    suggestions: [50, 100, 200],
  });
  const [result, setResult] = useState<{ sale?: SaleDetail; error?: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= DESKTOP_BREAKPOINT) setMode('desktop');
      else if (width >= TABLET_BREAKPOINT) setMode('tablet');
      else setMode('mobile');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync cart with product updates
  useEffect(() => {
    setCartItems((prev) =>
      prev.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return item;
        return { ...item, stock: product.stock };
      }),
    );
  }, [products]);

  // Calculate totals
  useEffect(() => {
    const subtotal = cartItems.reduce((acc, item) => acc + item.subtotal, 0);
    const tax = subtotal * 0.12; // Example tax calc
    const total = subtotal; // Assuming subtotal includes tax for simplicity or adjust as needed

    setPayment((prev) => {
      const paidWith = prev.paidWith || 0;
      const change = paidWith - total;
      return { ...prev, subtotal: total - tax, tax, total, change };
    });
  }, [cartItems, payment.paidWith]);

  const statusInfo: SaleStatusInfo = {
    pos: 'Caja Principal',
    user: 'Admin',
    shift: 'Matutino',
    document: cartItems.length ? `${cartItems.length} items` : 'Nueva Venta',
  };

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const term = search.toLowerCase();
    return products
      .filter(p => p.active !== false && (p.name.toLowerCase().includes(term) || p.code.toLowerCase().includes(term)))
      .map(p => ({
        id: p.id,
        name: p.name,
        code: p.code,
        price: p.price,
        stock: p.stock,
        minStock: p.minStock,
        stockState: calcStockState(p)
      }));
  }, [products, search]);

  const handleAddItem = useCallback((productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock <= 0) return;

    setCartItems(prev => {
      const existing = prev.find(i => i.productId === productId);
      if (existing) {
        if (existing.qty >= product.stock) return prev;
        return prev.map(i => i.productId === productId ? { ...i, qty: i.qty + 1, subtotal: (i.qty + 1) * i.price } : i);
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        code: product.code,
        qty: 1,
        price: product.price,
        subtotal: product.price,
        stock: product.stock,
        discountPct: 0
      }];
    });
    setSearch(''); // Clear search after adding
  }, [products]);

  const handleQtyChange = useCallback((id: string, qty: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.productId !== id) return item;
      const newQty = Math.max(1, Math.min(qty, item.stock ?? Infinity));
      return { ...item, qty: newQty, subtotal: newQty * item.price };
    }));
  }, []);

  const handleRemove = useCallback((id: string) => {
    setCartItems(prev => prev.filter(i => i.productId !== id));
  }, []);

  const handleSubmitSale = async () => {
    if (cartItems.length === 0) return;
    setSubmitting(true);
    try {
      const payload = {
        docType: client.documentType,
        clientName: client.name || 'Consumidor Final',
        clientNit: client.nit || 'CF',
        user: 'admin', // TODO: Get real user
        items: cartItems.map(i => ({ productId: i.productId, qty: i.qty, price: i.price }))
      };
      const sale = await salesApi.create(payload);
      setResult({ sale });
      setCartItems([]);
      setClient({ ...client, name: 'Consumidor Final', nit: 'CF' });
      setPayment(prev => ({ ...prev, paidWith: 0 }));
      reloadProducts();
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : 'Error desconocido' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] gap-4 p-2">
      <SaleStatusStrip info={statusInfo} />
      <StepFlow activeStep={activeStep} />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        {/* Left Column: Search & Results */}
        <div className="lg:col-span-4 flex flex-col min-h-0">
          <SearchPanel
            hidden={false}
            value={search}
            onChange={setSearch}
            onClear={() => setSearch('')}
            results={searchResults}
            onAddItem={handleAddItem}
            loading={loadingProducts}
            error={productsError}
            onRetry={reloadProducts}
          />
        </div>

        {/* Middle Column: Cart */}
        <div className="lg:col-span-5 flex flex-col min-h-0">
          <CartPanel
            hidden={false}
            items={cartItems}
            onContinue={() => setActiveStep('cliente')}
            onQtyChange={handleQtyChange}
            onPriceChange={() => { }} // Read-only price for now
            onRemove={handleRemove}
            onClear={() => setCartItems([])}
          />
        </div>

        {/* Right Column: Client & Payment */}
        <div className="lg:col-span-3 flex flex-col min-h-0">
          <ClientPaymentPanel
            hidden={false}
            client={client}
            payment={payment}
            isPaymentStep={activeStep === 'pago' || activeStep === 'cliente'} // Show panel for both steps but change content
            onContinue={activeStep === 'cliente' ? () => setActiveStep('pago') : handleSubmitSale}
            onClientChange={(p) => setClient(prev => ({ ...prev, ...p }))}
            onPaidWithChange={(v) => setPayment(prev => ({ ...prev, paidWith: v }))}
          />
        </div>
      </div>

      <ShortcutsGrid />
      <SaleResultModal result={result} onClose={() => setResult(null)} />
    </div>
  );
};

export default SalesPOS;
