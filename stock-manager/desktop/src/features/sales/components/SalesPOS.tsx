import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { salesApi } from '@/shared/api/sales';
import { useProductsInventory } from '@/shared/hooks/useProductsInventory';
import type { SaleCartItem, SaleClientInfo, SalePaymentSummary, SaleDetail } from '@/shared/types/sales';
import type { ProductItem } from '@/shared/types/products';
import { cn } from '@/shared/utils/cn';
import Modal from '@/ui/molecules/Modal/Modal';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  Squares2X2Icon,
  ListBulletIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import ProductCard from './ProductCard';
import CartSidebar from './CartSidebar';
import PaymentModal from './PaymentModal';

// --- Types ---
type ViewMode = 'grid' | 'list';

// --- Helper Components ---
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
        <button onClick={onClose} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors">
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
              <span className="text-emerald-400 font-bold">Q{sale.total.toFixed(2)}</span>
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
  // State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { products, loading: loadingProducts, error: productsError, reload: reloadProducts } = useProductsInventory();
  const [cartItems, setCartItems] = useState<SaleCartItem[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [result, setResult] = useState<{ sale?: SaleDetail; error?: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Derived State
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Search Filter
    if (search.trim()) {
      const term = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.code.toLowerCase().includes(term)
      );
    }

    // Category Filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.categoryId === selectedCategory); // Assuming categoryId exists on ProductItem
    }

    return filtered.filter(p => p.active !== false);
  }, [products, search, selectedCategory]);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.categoryName).filter((c): c is string => !!c));
    return ['all', ...Array.from(cats)];
  }, [products]);

  // Handlers
  const handleAddToCart = useCallback((product: ProductItem) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        if (existing.qty >= product.stock) return prev;
        return prev.map(i => i.productId === product.id ? { ...i, qty: i.qty + 1, subtotal: (i.qty + 1) * i.price } : i);
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
  }, []);

  const handleUpdateQty = useCallback((id: string, qty: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.productId !== id) return item;
      const newQty = Math.max(1, Math.min(qty, item.stock ?? Infinity));
      return { ...item, qty: newQty, subtotal: newQty * item.price };
    }));
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setCartItems(prev => prev.filter(i => i.productId !== id));
  }, []);

  const handleClearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const handleConfirmSale = async (client: SaleClientInfo, payment: SalePaymentSummary) => {
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
      setIsPaymentModalOpen(false);
      reloadProducts();
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : 'Error desconocido' });
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate Total
  const cartTotal = cartItems.reduce((acc, item) => acc + item.subtotal, 0);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#0b1121]">
      {/* Main Content - Product Grid */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header / Toolbar */}
        <header className="flex flex-col gap-4 p-6 border-b border-white/5 bg-[#0b1121]/95 backdrop-blur-xl z-10">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-2xl">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:bg-white/10 focus:outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={cn("p-2.5 rounded-lg border transition-colors", viewMode === 'grid' ? "bg-indigo-600 border-transparent text-white" : "bg-white/5 border-white/5 text-slate-400 hover:text-white")}
              >
                <Squares2X2Icon className="w-5 h-5" />
              </button>
              {/* List view not fully implemented yet, but button exists for future */}
              <button
                onClick={() => setViewMode('list')}
                className={cn("p-2.5 rounded-lg border transition-colors", viewMode === 'list' ? "bg-indigo-600 border-transparent text-white" : "bg-white/5 border-white/5 text-slate-400 hover:text-white")}
              >
                <ListBulletIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Categories / Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
            <FunnelIcon className="w-5 h-5 text-slate-500 mr-2 flex-shrink-0" />
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium border whitespace-nowrap transition-colors",
                  selectedCategory === cat
                    ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                    : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white"
                )}
              >
                {cat === 'all' ? 'Todos' : cat}
              </button>
            ))}
          </div>
        </header>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {loadingProducts ? (
            <div className="flex items-center justify-center h-full text-slate-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mr-3" />
              Cargando productos...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
              <MagnifyingGlassIcon className="w-16 h-16 opacity-20" />
              <p>No se encontraron productos</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Cart */}
      <div className="w-[400px] flex-shrink-0 border-l border-white/5 bg-[#0b1121]">
        <CartSidebar
          items={cartItems}
          onUpdateQty={handleUpdateQty}
          onRemove={handleRemoveItem}
          onClear={handleClearCart}
          onCheckout={() => setIsPaymentModalOpen(true)}
        />
      </div>

      {/* Modals */}
      <PaymentModal
        open={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        total={cartTotal}
        onConfirm={handleConfirmSale}
        submitting={submitting}
      />

      <SaleResultModal
        result={result}
        onClose={() => setResult(null)}
      />
    </div>
  );
};

export default SalesPOS;
