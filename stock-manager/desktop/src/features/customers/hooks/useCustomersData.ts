import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { customersApi, type ListCustomersParams, type SaveCustomerPayload } from '@/shared/api/customers';
import { ApiError } from '@/shared/api/types';
import { subscribeRealtime } from '@/shared/api/realtime';
import { CUSTOMERS } from '@/shared/data/customers';
import type { CustomerItem, CustomerStatus, CustomerType } from '@/shared/types/customers';

type Cache = Record<number, { data: CustomerItem[]; total: number; page: number; pageSize: number }>;

export type CustomerFilters = {
  search: string;
  status: CustomerStatus | 'all';
  city: string | 'all';
  type: CustomerType | 'all';
  credit: 'con' | 'sin' | 'all';
};

export type CustomerFormState = {
  nit: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  type: CustomerType;
  hasCredit: boolean;
  creditLimit: number;
  creditUsed: number;
  discount: number;
  status: CustomerStatus;
};

const buildFormState = (customer?: CustomerItem): CustomerFormState => ({
  nit: customer?.nit ?? '',
  name: customer?.name ?? '',
  phone: customer?.phone ?? '',
  email: customer?.email ?? '',
  city: customer?.city ?? '',
  type: customer?.type ?? 'persona-natural',
  hasCredit: customer?.hasCredit ?? false,
  creditLimit: customer?.creditLimit ?? 0,
  creditUsed: customer?.creditUsed ?? 0,
  discount: customer?.discount ?? 0,
  status: customer?.status ?? 'activo',
});

export function useCustomersData(pageSize = 15) {
  const [filters, setFilters] = useState<CustomerFilters>({
    search: '',
    status: 'all',
    city: 'all',
    type: 'all',
    credit: 'all',
  });
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [cache, setCache] = useState<Cache>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<CustomerFormState>(buildFormState());
  const filtersRef = useRef(filters);

  const current = cache[page];
  const customers = current?.data ?? [];
  const total = current?.total ?? 0;

  const selected = useMemo(() => customers.find((c) => c.id === selectedId) ?? customers[0], [customers, selectedId]);

  useEffect(() => {
    const timer = setTimeout(() => setFilters((prev) => ({ ...prev, search: searchInput })), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (JSON.stringify(filtersRef.current) !== JSON.stringify(filters)) {
      filtersRef.current = filters;
      setCache({});
      setPage(1);
    }
  }, [filters]);

  useEffect(() => {
    if (selected) setForm(buildFormState(selected));
  }, [selected]);

  const applyFallback = useCallback(() => {
    const filtered = CUSTOMERS.filter((c) => {
      if (filters.status !== 'all' && c.status !== filters.status) return false;
      if (filters.city !== 'all' && c.city !== filters.city) return false;
      if (filters.type !== 'all' && c.type !== filters.type) return false;
      if (filters.credit === 'con' && !c.hasCredit) return false;
      if (filters.credit === 'sin' && c.hasCredit) return false;
      if (filters.search.trim()) {
        const term = filters.search.toLowerCase();
        const haystack = `${c.nit} ${c.name} ${c.phone} ${c.email}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
    setCache({
      1: { data: filtered, total: filtered.length, page: 1, pageSize },
    });
    setSelectedId(filtered[0]?.id ?? null);
  }, [filters, pageSize]);

  const fetchPage = useCallback(
    async (target: number, force = false) => {
      if (!force && cache[target]) return cache[target];
      setLoading(true);
      try {
        const params: ListCustomersParams = {
          q: filters.search,
          status: filters.status,
          city: filters.city,
          type: filters.type,
          credit: filters.credit,
          page: target,
          pageSize,
        };
        const response = await customersApi.list(params);
        setCache((prev) => ({
          ...prev,
          [target]: {
            data: response.data.filter((c) => !c.deletedAt),
            total: response.total,
            page: response.page,
            pageSize: response.pageSize,
          },
        }));
        if (!selectedId && response.data.length) setSelectedId(response.data[0].id);
        setError(null);
        return response;
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : 'No se pudo cargar clientes';
        setError(msg);
        applyFallback();
        return null;
      } finally {
        setLoading(false);
      }
    },
    [applyFallback, cache, filters, pageSize, selectedId],
  );

  useEffect(() => {
    fetchPage(page).catch(() => undefined);
  }, [fetchPage, page]);

  useEffect(() => {
    const nextPages = [page + 1, page + 2, page + 3];
    nextPages.forEach((p) => fetchPage(p).catch(() => undefined));
  }, [fetchPage, page]);

  useEffect(() => {
    const unsubscribe = subscribeRealtime((event) => {
      if (event.type === 'customer.created' || event.type === 'customer.updated' || event.type === 'customer.deleted') {
        fetchPage(page, true).catch(() => undefined);
        [page + 1, page + 2, page + 3].forEach((p) => fetchPage(p, true).catch(() => undefined));
      }
    });
    return unsubscribe;
  }, [fetchPage, page]);

  const saveCustomer = useCallback(
    async (id?: string) => {
      const payload: SaveCustomerPayload = { ...form };
      if (id) {
        await customersApi.update(id, payload);
      } else if (selectedId) {
        await customersApi.update(selectedId, payload);
      }
      await fetchPage(page, true);
    },
    [fetchPage, form, page, selectedId],
  );

  const createCustomer = useCallback(
    async (payload?: SaveCustomerPayload) => {
      const created = await customersApi.create(payload ?? (form as SaveCustomerPayload));
      setSelectedId(created.id);
      await fetchPage(1, true);
    },
    [fetchPage, form],
  );

  const deleteCustomer = useCallback(
    async (id?: string) => {
      const target = id ?? selectedId;
      if (!target) return;
      await customersApi.remove(target);
      setSelectedId(null);
      await fetchPage(page, true);
    },
    [fetchPage, page, selectedId],
  );

  const goToPage = useCallback(
    (next: number) => setPage((prev) => Math.max(1, next === prev ? prev : next)),
    [],
  );

  return {
    filters,
    setFilters,
    searchInput,
    setSearchInput,
    customers,
    loading,
    error,
    total,
    page,
    pageSize,
    setPage: goToPage,
    selected,
    selectedId,
    setSelectedId,
    form,
    setForm,
    saveCustomer,
    createCustomer,
    deleteCustomer,
  };
}
