import { memo } from 'react';
import { SaleCartItem } from '@/shared/types/sales';
import { formatMoney } from '@/shared/utils/format';
import { cn } from '@/shared/utils/cn';
import { TrashIcon, ShoppingCartIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

interface CartSidebarProps {
    items: SaleCartItem[];
    onUpdateQty: (id: string, qty: number) => void;
    onRemove: (id: string) => void;
    onClear: () => void;
    onCheckout: () => void;
}

const CartItemRow = memo(({ item, onUpdateQty, onRemove }: {
    item: SaleCartItem;
    onUpdateQty: (id: string, qty: number) => void;
    onRemove: (id: string) => void;
}) => (
    <div className="group relative flex gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
        {/* Product Info */}
        <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
                <h4 className="text-sm font-medium text-slate-200 truncate pr-4">{item.name}</h4>
                <button
                    onClick={() => onRemove(item.productId)}
                    className="text-slate-500 hover:text-rose-400 transition-colors -mr-1 -mt-1 p-1"
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">{formatMoney(item.price)} x unidad</div>

            <div className="flex items-center justify-between mt-3">
                {/* Qty Controls */}
                <div className="flex items-center gap-3 bg-black/20 rounded-lg p-1 border border-white/5">
                    <button
                        onClick={() => onUpdateQty(item.productId, item.qty - 1)}
                        className="p-1 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors disabled:opacity-30"
                        disabled={item.qty <= 1}
                    >
                        <MinusIcon className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                    <button
                        onClick={() => onUpdateQty(item.productId, item.qty + 1)}
                        className="p-1 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors disabled:opacity-30"
                        disabled={item.qty >= (item.stock || 999)}
                    >
                        <PlusIcon className="w-3 h-3" />
                    </button>
                </div>

                {/* Subtotal */}
                <span className="text-sm font-bold text-white">{formatMoney(item.subtotal)}</span>
            </div>
        </div>
    </div>
));

const CartSidebar = memo(({ items, onUpdateQty, onRemove, onClear, onCheckout }: CartSidebarProps) => {
    const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
    const tax = subtotal * 0.12; // Example tax logic, adjust as needed
    const total = subtotal; // Assuming price includes tax

    return (
        <div className="flex flex-col h-full bg-[#0b1121]/95 backdrop-blur-xl border-l border-white/5 w-full max-w-md">
            {/* Header */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-black/20">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                        <ShoppingCartIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Carrito</h3>
                        <p className="text-xs text-slate-500">{items.length} productos</p>
                    </div>
                </div>
                {items.length > 0 && (
                    <button
                        onClick={onClear}
                        className="text-xs font-medium text-slate-500 hover:text-rose-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-rose-500/10"
                    >
                        Vaciar
                    </button>
                )}
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-600 opacity-50">
                        <ShoppingCartIcon className="w-16 h-16 stroke-1" />
                        <p className="text-sm font-medium">Tu carrito está vacío</p>
                    </div>
                ) : (
                    items.map(item => (
                        <CartItemRow
                            key={item.productId}
                            item={item}
                            onUpdateQty={onUpdateQty}
                            onRemove={onRemove}
                        />
                    ))
                )}
            </div>

            {/* Footer / Totals */}
            <div className="p-5 bg-black/40 border-t border-white/5 space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-400">
                        <span>Subtotal</span>
                        <span>{formatMoney(total - tax)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-400">
                        <span>Impuestos (12%)</span>
                        <span>{formatMoney(tax)}</span>
                    </div>
                    <div className="flex justify-between items-end pt-2 border-t border-white/10">
                        <span className="text-base font-medium text-white">Total a Pagar</span>
                        <span className="text-2xl font-bold text-emerald-400">{formatMoney(total)}</span>
                    </div>
                </div>

                <button
                    onClick={onCheckout}
                    disabled={items.length === 0}
                    className={cn(
                        "w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all duration-200",
                        items.length === 0
                            ? "bg-slate-700/50 cursor-not-allowed text-slate-500"
                            : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-[0.98]"
                    )}
                >
                    Procesar Venta
                </button>
            </div>
        </div>
    );
});

export default CartSidebar;
