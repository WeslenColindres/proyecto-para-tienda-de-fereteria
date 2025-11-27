import { memo } from 'react';
import { ProductItem } from '@/shared/types/products';
import { formatMoney } from '@/shared/utils/format';
import { cn } from '@/shared/utils/cn';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

interface ProductCardProps {
    product: ProductItem;
    onAdd: (product: ProductItem) => void;
}

const ProductCard = memo(({ product, onAdd }: ProductCardProps) => {
    const hasStock = product.stock > 0;
    const isLowStock = product.stock <= (product.minStock || 5);

    return (
        <button
            onClick={() => hasStock && onAdd(product)}
            disabled={!hasStock}
            className={cn(
                "group relative flex flex-col w-full text-left rounded-xl overflow-hidden transition-all duration-300",
                "bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10",
                !hasStock && "opacity-50 grayscale cursor-not-allowed"
            )}
        >
            {/* Image Aspect Ratio Container */}
            <div className="relative w-full aspect-square bg-black/20 overflow-hidden">
                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-full text-slate-600">
                        <span className="text-4xl font-bold opacity-20">{product.name.charAt(0)}</span>
                    </div>
                )}

                {/* Stock Badge */}
                <div className={cn(
                    "absolute top-2 right-2 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border",
                    !hasStock
                        ? "bg-rose-500/20 text-rose-200 border-rose-500/30"
                        : isLowStock
                            ? "bg-amber-500/20 text-amber-200 border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-200 border-emerald-500/30"
                )}>
                    {hasStock ? `${product.stock} en stock` : 'Agotado'}
                </div>

                {/* Add Overlay */}
                {hasStock && (
                    <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="bg-white text-indigo-600 p-3 rounded-full shadow-xl transform scale-50 group-hover:scale-100 transition-transform duration-300">
                            <ShoppingCartIcon className="w-6 h-6" />
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 p-3 gap-1">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="text-sm font-medium text-slate-200 line-clamp-2 leading-tight group-hover:text-white transition-colors">
                        {product.name}
                    </h3>
                </div>

                <div className="mt-auto pt-2 flex items-end justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 font-mono">{product.code}</span>
                        <span className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                            {formatMoney(product.price)}
                        </span>
                    </div>
                </div>
            </div>
        </button>
    );
});

export default ProductCard;
