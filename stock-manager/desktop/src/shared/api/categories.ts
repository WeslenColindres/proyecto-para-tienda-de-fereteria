import { apiFetch } from './httpClient';
import type { Category } from '../types/products';

export const categoriesApi = {
  list: () => apiFetch<Category[]>('/api/categories'),
  create: (payload: Partial<Category>) =>
    apiFetch<Category>('/api/categories', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string, payload: Partial<Category>) =>
    apiFetch<Category>(`/api/categories/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id: string) => apiFetch<Category>(`/api/categories/${id}`, { method: 'DELETE' }),
};
