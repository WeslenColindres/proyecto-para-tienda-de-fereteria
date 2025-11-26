import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { salesApi } from '../api/sales';
import { ApiError } from '../api/types';
import { subscribeRealtime } from '../api/realtime';
import type { SaleDetail, SaleStatus } from '../types/sales';
import type { SaleDocumentType } from '../types/sales';
import type { ListSalesParams } from '../api/sales';

type Cache = Record<number, { data: SaleDetail[]; total: number; page: number; pageSize: number }>;

export type UseSalesChunksFilters = Omit<ListSalesParams, 'page' | 'pageSize'> & {
  pageSize?: number;
};

export function useSalesChunks(filters: UseSalesChunksFilters) {
  const [page, setPage] = useState(1);
  const [cache, setCache] = useState<Cache>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pageSize = filters.pageSize ?? 20;
  const filtersRef = useRef(filters);

  const reset = useCallback(() => {
    setCache({});
    setPage(1);
    setError(null);
  }, []);

  useEffect(() => {
    if (JSON.stringify(filtersRef.current) !== JSON.stringify(filters)) {
      filtersRef.current = filters;
      reset();
    }
  }, [filters, reset]);

  const fetchPage = useCallback(
    async (targetPage: number, force = false) => {
      if (!force && cache[targetPage]) {
        return cache[targetPage];
      }
      setLoading(true);
      try {
        const response = await salesApi.list({
          ...(filters as Partial<ListSalesParams>),
          page: targetPage,
          pageSize,
        });
        setCache((prev) => ({
          ...prev,
          [targetPage]: {
            data: response.data,
            total: response.total,
            page: response.page,
            pageSize: response.pageSize,
          },
        }));
        setError(null);
        return response;
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'No se pudo cargar el listado';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [cache, filters, pageSize],
  );

  useEffect(() => {
    fetchPage(page).catch(() => undefined);
  }, [fetchPage, page]);

  const current = cache[page];
  const total = current?.total ?? 0;
  const maxPage = useMemo(() => {
    return current ? Math.max(1, Math.ceil(current.total / pageSize)) : Math.max(1, page);
  }, [current, page, pageSize]);

  useEffect(() => {
    const nextPages = [page + 1, page + 2, page + 3].filter((p) => p <= maxPage);
    nextPages.forEach((p) => fetchPage(p).catch(() => undefined));
  }, [fetchPage, maxPage, page]);

  useEffect(() => {
    const unsubscribe = subscribeRealtime((event) => {
      if (event.type === 'sale.created' || event.type === 'inventory.updated') {
        fetchPage(page, true).catch(() => undefined);
        [page + 1, page + 2, page + 3].forEach((p) => fetchPage(p, true).catch(() => undefined));
      }
    });
    return unsubscribe;
  }, [fetchPage, page]);

  const goToPage = useCallback(
    (next: number) => {
      const target = Math.min(Math.max(1, next), maxPage || 1);
      setPage(target);
    },
    [maxPage],
  );

  return {
    page,
    pageSize,
    total,
    data: current?.data ?? [],
    loading,
    error,
    setPage: goToPage,
    reload: () => fetchPage(page, true),
    hasNext: page < maxPage,
    hasPrev: page > 1,
  };
}

