import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { suppliersApi, type ListSuppliersParams, type SaveSupplierPayload } from '@/shared/api/suppliers';
import { ApiError } from '@/shared/api/types';
import { subscribeRealtime } from '@/shared/api/realtime';
import { SUPPLIERS, SUPPLIER_PURCHASES } from '@/shared/data/suppliers';
import type { SupplierCatalogs, SupplierItem, SupplierPurchaseRow, SupplierStatus } from '@/shared/types/suppliers';

export type SupplierFilters = {
  search: string;
  status: SupplierStatus | 'all';
  cityId: string | 'all';
  categoryId: string | 'all';
};

export type SupplierFormState = {
  nit: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  cityId: string;
  categoryId: string;
  address: string;
  creditDays: number;
  creditLimit: number;
  status: SupplierStatus;
};

type CacheEntry = {
  data: SupplierItem[];
  total: number;
  page: number;
  pageSize: number;
  counters: Record<SupplierStatus, number>;
};

const buildFormState = (supplier?: SupplierItem): SupplierFormState => ({
  nit: supplier?.nit ?? '',
  name: supplier?.name ?? '',
  contactName: supplier?.contactName ?? '',
  phone: supplier?.phone ?? '',
  email: supplier?.email ?? '',
  cityId: supplier?.cityId ?? 'city-capital',
  categoryId: supplier?.categoryId ?? 'sup-cat-alimentos',
  address: supplier?.address ?? '',
  creditDays: supplier?.creditDays ?? 0,
  creditLimit: supplier?.creditLimit ?? 0,
  status: supplier?.status ?? 'activo',
});

export function useSuppliers() {
  const [filters, setFilters] = useState<SupplierFilters>({
    search: '',
    status: 'all',
    cityId: 'all',
    categoryId: 'all',
  });
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [catalogs, setCatalogs] = useState<SupplierCatalogs>({ cities: [], categories: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [form, setForm] = useState<SupplierFormState>(buildFormState());
  const [purchases, setPurchases] = useState<SupplierPurchaseRow[]>([]);
  const [cacheVersion, setCacheVersion] = useState(0); // Force re-render when cache changes

  const pageSize = 12;
  const filtersRef = useRef<SupplierFilters>(filters);
  const cacheRef = useRef<Record<number, CacheEntry>>({});
  const isFetchingRef = useRef<Set<number>>(new Set()); // Track in-flight requests

  const currentEntry = cacheRef.current[page];
  const suppliers = currentEntry?.data ?? [];
  const total = currentEntry?.total ?? 0;
  const counters = currentEntry?.counters ?? { activo: 0, inactivo: 0, moroso: 0 };

  const selected = useMemo(() => suppliers.find((s) => s.id === selectedId) ?? suppliers[0], [selectedId, suppliers]);

  useEffect(() => {
    if (selected) {
      setForm(buildFormState(selected));
    }
  }, [selected]);

  const resetCache = useCallback(() => {
    cacheRef.current = {};
    isFetchingRef.current.clear();
    setCacheVersion((v) => v + 1); // Force re-render
    setPage(1);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput, status: prev.status, cityId: prev.cityId, categoryId: prev.categoryId }));
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (JSON.stringify(filtersRef.current) !== JSON.stringify(filters)) {
      filtersRef.current = filters;
      resetCache();
    }
  }, [filters, resetCache]);

  const applyListFallback = useCallback(() => {
    const matches = SUPPLIERS.filter((supplier) => {
      if (filters.status !== 'all' && supplier.status !== filters.status) return false;
      if (filters.cityId !== 'all' && supplier.cityId !== filters.cityId) return false;
      if (filters.categoryId !== 'all' && supplier.categoryId !== filters.categoryId) return false;
      if (filters.search.trim()) {
        const term = filters.search.toLowerCase();
        const haystack = `${supplier.nit} ${supplier.name} ${supplier.contactName} ${supplier.email}`.toLowerCase();
        return haystack.includes(term);
      }
      return true;
    });
    cacheRef.current = {
      1: {
        data: matches,
        total: matches.length,
        page: 1,
        pageSize,
        counters: matches.reduce(
          (acc, supplier) => {
            acc[supplier.status] += 1;
            return acc;
          },
          { activo: 0, inactivo: 0, moroso: 0 } as Record<SupplierStatus, number>,
        ),
      },
    };
    setCacheVersion((v) => v + 1); // Force re-render
    setSelectedId(matches[0]?.id ?? null);
  }, [filters, pageSize]);

  const fetchPage = useCallback(
    async (targetPage: number, force = false) => {
      // Check if already cached and not forcing refresh
      if (!force && cacheRef.current[targetPage]) return cacheRef.current[targetPage];

      // Prevent duplicate in-flight requests
      if (isFetchingRef.current.has(targetPage)) return null;

      isFetchingRef.current.add(targetPage);
      setLoading(true);
      try {
        const params: ListSuppliersParams = {
          ...filters,
          q: filters.search,
          page: targetPage,
          pageSize,
        };
        const response = await suppliersApi.list(params);
        cacheRef.current = {
          ...cacheRef.current,
          [targetPage]: {
            data: response.data,
            total: response.total,
            page: response.page,
            pageSize: response.pageSize,
            counters: response.counters,
          },
        };
        setCacheVersion((v) => v + 1); // Force re-render
        if (!selectedId && response.data.length > 0) {
          setSelectedId(response.data[0].id);
          setForm(buildFormState(response.data[0]));
        }
        setError(null);
        return response;
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'No se pudo cargar proveedores';
        setError(message);
        applyListFallback();
        return null;
      } finally {
        isFetchingRef.current.delete(targetPage);
        setLoading(false);
      }
    },
    [applyListFallback, filters, pageSize, selectedId],
  );

  useEffect(() => {
    fetchPage(page).catch(() => undefined);
  }, [fetchPage, page]);

  useEffect(() => {
    const nextPages = [page + 1, page + 2, page + 3];
    nextPages.forEach((p) => fetchPage(p).catch(() => undefined));
  }, [fetchPage, page]);

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const data = await suppliersApi.catalogs();
        setCatalogs(data);
      } catch {
        const cityMap = new Map<string, { id: string; name: string }>();
        const categoryMap = new Map<string, { id: string; name: string; code: string }>();
        SUPPLIERS.forEach((s) => {
          if (!cityMap.has(s.cityId)) cityMap.set(s.cityId, { id: s.cityId, name: s.cityName ?? s.cityId });
          if (!categoryMap.has(s.categoryId)) {
            categoryMap.set(s.categoryId, { id: s.categoryId, name: s.categoryName ?? s.categoryId, code: s.categoryId });
          }
        });
        setCatalogs({ cities: Array.from(cityMap.values()), categories: Array.from(categoryMap.values()) });
      }
    };
    loadCatalogs().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!selected?.id) {
      setPurchases([]);
      return;
    }
    const loadPurchases = async () => {
      try {
        const items = await suppliersApi.purchases(selected.id, 5);
        setPurchases(items);
      } catch {
        setPurchases(SUPPLIER_PURCHASES.filter((p) => p.supplierId === selected.id));
      }
    };
    loadPurchases().catch(() => undefined);
  }, [selected?.id]);

  useEffect(() => {
    const unsubscribe = subscribeRealtime((event) => {
      if (event.type === 'supplier.created' || event.type === 'supplier.updated' || event.type === 'supplier.deleted') {
        fetchPage(page, true).catch(() => undefined);
        [page + 1, page + 2, page + 3].forEach((p) => fetchPage(p, true).catch(() => undefined));
        if (event.type === 'supplier.deleted' && event.payload?.id === selectedId) {
          setSelectedId(null);
        }
      }
    });
    return unsubscribe;
  }, [fetchPage, page, selectedId]);

  const selectSupplier = useCallback(
    (id: string) => {
      setSelectedId(id);
      const found = suppliers.find((s) => s.id === id);
      if (found) {
        setForm(buildFormState(found));
      }
    },
    [suppliers],
  );

  const saveSupplier = useCallback(
    async (id?: string) => {
      const payload: SaveSupplierPayload = { ...form };
      if (!id && !selected?.id) return;
      if (id) {
        const updated = await suppliersApi.update(id, payload);
        setForm(buildFormState(updated));
        setSelectedId(updated.id);
        setIsEditing(false);
        fetchPage(page, true).catch(() => undefined);
      } else if (selected?.id) {
        const updated = await suppliersApi.update(selected.id, payload);
        setForm(buildFormState(updated));
        setIsEditing(false);
        fetchPage(page, true).catch(() => undefined);
      }
    },
    [fetchPage, form, page, selected?.id],
  );

  const createSupplier = useCallback(
    async (payloadOverride?: SaveSupplierPayload) => {
      const payload: SaveSupplierPayload = payloadOverride ?? { ...form };
      const created = await suppliersApi.create(payload);
      setShowCreate(false);
      setSelectedId(created.id);
      setForm(buildFormState(created));
      setIsEditing(false);
      fetchPage(1, true).catch(() => undefined);
    },
    [fetchPage, form],
  );

  const deleteSupplier = useCallback(
    async () => {
      if (!selected?.id) return;
      await suppliersApi.remove(selected.id);
      setShowDelete(false);
      setIsEditing(false);
      setSelectedId(null);
      fetchPage(page, true).catch(() => undefined);
    },
    [fetchPage, page, selected?.id],
  );

  const filtersSummary = useMemo(() => {
    const chips = [];
    chips.push(filters.status === 'all' ? 'Todos los estados' : `Estado: ${filters.status}`);
    if (filters.cityId !== 'all') chips.push(`Ciudad: ${catalogs.cities.find((c) => c.id === filters.cityId)?.name ?? filters.cityId}`);
    if (filters.categoryId !== 'all') chips.push(`Categoria: ${catalogs.categories.find((c) => c.id === filters.categoryId)?.name ?? filters.categoryId}`);
    if (filters.search.trim()) chips.push(`Busqueda: "${filters.search}"`);
    return chips.join(' · ');
  }, [catalogs.categories, catalogs.cities, filters]);

  return {
    filters,
    setFilters,
    searchInput,
    setSearchInput,
    suppliers,
    loading,
    error,
    total,
    page,
    pageSize,
    counters,
    setPage,
    selected,
    selectedId,
    selectSupplier,
    form,
    setForm,
    isEditing,
    setIsEditing,
    saveSupplier,
    deleteSupplier,
    createSupplier,
    showCreate,
    setShowCreate,
    showDelete,
    setShowDelete,
    showHistory,
    setShowHistory,
    purchases,
    catalogs,
    filtersSummary,
    resetForm: () => setForm(buildFormState(selected ?? undefined)),
  };
}
