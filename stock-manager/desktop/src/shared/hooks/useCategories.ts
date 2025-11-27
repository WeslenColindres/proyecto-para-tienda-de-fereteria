import { useCallback, useEffect, useState } from 'react';
import { categoriesApi } from '../api/categories';
import { ApiError } from '../api/types';
import type { Category } from '../types/products';

const FALLBACK: Category[] = [
  { id: '1', name: 'General', active: true, description: 'Categoria por defecto' },
  { id: '2', name: 'Bebidas', active: true },
  { id: '3', name: 'Panaderia', active: true },
];

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(FALLBACK);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoriesApi.list();
      setCategories(data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudieron cargar categorias';
      setError(message);
      setCategories(FALLBACK);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { categories, loading, error, reload: load };
}
