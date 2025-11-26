import { useCallback, useEffect, useState } from 'react';
import { productsApi } from '../api/products';
import { ApiError } from '../api/types';
import { subscribeRealtime } from '../api/realtime';
import type { ProductItem } from '../types/products';
import type { RealtimeEvent } from '../types/realtime';

export function useProductsInventory() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizeProduct = useCallback(
    (payload: any): ProductItem => ({
      id: payload.id,
      code: payload.code,
      name: payload.name,
      description: payload.description ?? '',
      category: payload.categoryName ?? payload.category ?? 'General',
      categoryId: payload.categoryId,
      stock: payload.stock ?? 0,
      minStock: payload.minStock ?? 0,
      price: payload.price ?? 0,
      cost: payload.cost ?? payload.price ?? 0,
      barcode: payload.barcode ?? payload.code ?? '',
      tax: typeof payload.tax === 'number' ? payload.tax : 12,
      unit: payload.unit ?? 'u',
      status: payload.status ?? (payload.active === false ? 'inactivo' : 'activo'),
      active: payload.status ? payload.status !== 'descontinuado' : payload.active !== false,
      updatedAt: payload.updatedAt,
    }),
    [],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await productsApi.list({ pageSize: 200 });
      const flat = response.chunks?.flatMap?.((chunk) => chunk.data) ?? [];
      setProducts((flat.length ? flat : response.data).map((p) => normalizeProduct(p)));
      setError(null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudieron cargar productos';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [normalizeProduct]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const unsubscribe = subscribeRealtime((event: RealtimeEvent) => {
      if (event.type === 'inventory.updated') {
        setProducts((prev) =>
          prev.map((product) => {
            const match = event.payload.find((item) => item.id === product.id);
            return match ? { ...product, stock: match.stock } : product;
          }),
        );
      }
      if (event.type === 'product.updated') {
        setProducts((prev) => {
          const incoming = normalizeProduct(event.payload);
          const exists = prev.some((p) => p.id === incoming.id);
          return exists ? prev.map((p) => (p.id === incoming.id ? incoming : p)) : [...prev, incoming];
        });
      }
      if (event.type === 'product.deleted') {
        setProducts((prev) => prev.filter((p) => p.id !== event.payload.id));
      }
    });

    return unsubscribe;
  }, [normalizeProduct]);

  return { products, loading, error, reload: load };
}
