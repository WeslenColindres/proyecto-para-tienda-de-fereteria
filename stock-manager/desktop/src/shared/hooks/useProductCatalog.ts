import { useCallback, useEffect, useMemo, useState } from 'react';
import { productsApi } from '../api/products';
import { ApiError } from '../api/types';
import { subscribeRealtime } from '../api/realtime';
import type {
  ProductFilters,
  ProductItem,
  ProductListResponse,
  ProductStatus,
} from '../types/products';
import type { RealtimeEvent } from '../types/realtime';

export type ProductFormState = {
  code: string;
  name: string;
  description: string;
  categoryId: string;
  barcode: string;
  cost: string;
  price: string;
  tax: string;
  unit: string;
  minStock: string;
  status: ProductStatus;
};

const buildFormState = (product?: ProductItem): ProductFormState => ({
  code: product?.code ?? '',
  name: product?.name ?? '',
  description: product?.description ?? '',
  categoryId: product?.categoryId ?? 'cat-general',
  barcode: product?.barcode ?? '',
  cost: product ? String(product.cost ?? 0) : '',
  price: product ? String(product.price ?? 0) : '',
  tax: product ? String(product.tax ?? 12) : '12',
  unit: product?.unit ?? 'unidad',
  minStock: product ? String(product.minStock ?? 0) : '',
  status: product?.status ?? 'activo',
});

export function useProductCatalog(initialFilters?: ProductFilters) {
  const [filters, setFilters] = useState<ProductFilters>(() => ({
    page: initialFilters?.page ?? 1,
    pageSize: initialFilters?.pageSize ?? 15,
    search: initialFilters?.search ?? '',
    categoryId: initialFilters?.categoryId ?? 'all',
    stockState: initialFilters?.stockState ?? 'all',
    status: initialFilters?.status ?? 'all',
  }));
  const [meta, setMeta] = useState({
    page: filters.page ?? 1,
    pageSize: filters.pageSize ?? 15,
    total: 0,
  });
  const [chunks, setChunks] = useState<Map<number, ProductItem[]>>(new Map());
  const [counters, setCounters] = useState({ critical: 0, low: 0, preventive: 0 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<'edit' | 'create'>('edit');
  const [formState, setFormState] = useState<ProductFormState>(() => buildFormState());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const products = useMemo(() => chunks.get(meta.page) ?? [], [chunks, meta.page]);

  const mergeResponse = useCallback(
    (response: ProductListResponse) => {

      const map = new Map(chunks);

      (response.chunks ?? []).forEach((chunk) => {
        map.set(chunk.page, chunk.data);
      });

      map.set(response.page, response.data);

      setChunks(map);
      setMeta({ page: response.page, pageSize: response.pageSize, total: response.total });
      setCounters(response.counters);

      if (!selectedId) {
         const first = response.data[0];
        if (first) {
          setSelectedId(first.id);
          setFormState(buildFormState(first));
          setMode('edit');
        }
      }
    },
    [chunks, selectedId],
  );

  const loadPage = useCallback(
    async (page: number = filters.page ?? 1, nextFilters: ProductFilters = filters) => {
      setLoading(true);
      setError(null);
      try {
        const response = await productsApi.list({ ...nextFilters, page });
        mergeResponse(response);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'No se pudieron cargar productos';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [filters, mergeResponse],
  );

  useEffect(() => {
    loadPage(1);
  }, [filters.search, filters.categoryId, filters.stockState, filters.status, filters.pageSize]); // eslint-disable-line react-hooks/exhaustive-deps

   useEffect(() => {
     // Si no hay productos y el total es 0, limpiamos selección y formulario
     if (meta.total === 0 && products.length === 0 && selectedId) {
       setSelectedId(null);
       setMode('create');
       setFormState(buildFormState());
     }
   }, [meta.total, products.length, selectedId]);
   
  const setPage = useCallback(
    (page: number) => {
      setFilters((prev) => ({ ...prev, page }));
      loadPage(page);
    },
    [loadPage],
  );

  const selectProduct = useCallback(
    (id: string | null) => {
      setSelectedId(id);
      if (!id) {
        setMode('create');
        setFormState(buildFormState());
        return;
      }
      const found = products.find((p) => p.id === id);
      if (found) {
        setMode('edit');
        setFormState(buildFormState(found));
      }
    },
    [products],
  );

  const createNew = useCallback(() => {
    setMode('create');
    setSelectedId(null);
    setFormState(buildFormState());
  }, []);

  const persistProduct = useCallback(async () => {
    const payload = {
      code: formState.code,
      name: formState.name,
      description: formState.description,
      categoryId: formState.categoryId,
      barcode: formState.barcode,
      cost: Number(formState.cost || 0),
      price: Number(formState.price || 0),
      tax: Number(formState.tax || 0),
      unit: formState.unit,
      minStock: Number(formState.minStock || 0),
      status: formState.status,
    };

    if (mode === 'create') {
      const created = await productsApi.create(payload);
      setFilters((prev) => ({ ...prev, page: 1 }));
      await loadPage(1);
      setSelectedId(created.id);
      setMode('edit');
      return created;
    }

    if (!selectedId) throw new ApiError('Selecciona un producto para actualizar', 400);
    const updated = await productsApi.update(selectedId, payload);
    await loadPage(meta.page);
    return updated;
  }, [formState, loadPage, meta.page, mode, selectedId]);

  const deleteProduct = useCallback(async () => {
    if (!selectedId) throw new ApiError('Selecciona un producto', 400);
    await productsApi.remove(selectedId);
    const nextSelection = products.find((p) => p.id !== selectedId);
    setSelectedId(nextSelection?.id ?? null);
    setMode(nextSelection ? 'edit' : 'create');
    setFormState(buildFormState(nextSelection ?? undefined));
    await loadPage(meta.page);
  }, [loadPage, meta.page, products, selectedId]);

  useEffect(() => {
    const unsubscribe = subscribeRealtime((event: RealtimeEvent) => {
      if (event.type === 'inventory.updated') {
        setChunks((prev) => {
          const next = new Map(prev);
          next.forEach((items, page) => {
            next.set(
              page,
              items.map((item) => {
                const match = event.payload.find((p: any) => p.id === item.id);
                return match ? { ...item, stock: match.stock } : item;
              }),
            );
          });
          return next;
        });
      }
      if (event.type === 'product.updated') {
        setChunks((prev) => {
          const next = new Map(prev);
          let found = false;
          next.forEach((items, page) => {
            const exists = items.some((p) => p.id === (event.payload as any).id);
            if (exists) {
              found = true;
              next.set(
                page,
                items.map((p) =>
                  p.id === (event.payload as any).id ? (event.payload as ProductItem) : p,
                ),
              );
            }
          });
          if (!found && meta.page === 1) {
            next.set(
              1,
              [event.payload as ProductItem, ...(next.get(1) ?? [])].slice(
                0,
                filters.pageSize ?? 15,
              ),
            );
          }
          return next;
        });
      }
      if (event.type === 'product.deleted') {
        setChunks((prev) => {
          const next = new Map(prev);
          next.forEach((items, page) => {
            next.set(
              page,
              items.filter((p) => p.id !== event.payload.id),
            );
          });
          return next;
        });
      }
    });

    return unsubscribe;
  }, [filters.pageSize, meta.page]);

  return {
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
    setMode,
    saveProduct: persistProduct,
    deleteProduct,
    setPage,
    reload: () => loadPage(meta.page),
  };
}
