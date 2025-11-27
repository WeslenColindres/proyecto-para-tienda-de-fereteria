import { ApiError } from './types';

const DEFAULT_API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');
const stripApiSuffix = (value: string) => value.replace(/\/api$/i, '');

const resolveBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const desktopBase = (window as any)?.stockManager?.apiBaseUrl;
    if (desktopBase) return stripApiSuffix(trimTrailingSlash(String(desktopBase)));
  }
  return stripApiSuffix(trimTrailingSlash(DEFAULT_API_BASE_URL));
};

export const getApiBaseUrl = () => resolveBaseUrl();
export const getWsUrl = () => `${getApiBaseUrl().replace(/^http/i, 'ws')}/ws`;

// Mantener compatibilidad con imports existentes
export const API_BASE_URL = getApiBaseUrl();
export const WS_URL = getWsUrl();

// Construye cabeceras seguras para cada request
const buildHeaders = (init?: RequestInit) => {
  const headers = new Headers(init?.headers as any);
  const isFormData = init?.body instanceof FormData;

  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Header de seguridad: identifica que la petición viene de la App Desktop
  headers.set('X-Source-App', 'stock-manager-desktop');

  const token = localStorage.getItem('auth_token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
};

const buildUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
};

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildUrl(path), {
    ...init,
    headers: buildHeaders(init),
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await response.json().catch(() => undefined) : undefined;

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      // Dispatch event to notify app (optional, but reload is safer)
      window.location.reload();
      throw new ApiError('Sesión expirada', response.status);
    }
    throw new ApiError(body?.message ?? 'Error en la solicitud', response.status, body?.error, body);
  }

  return body as T;
}

export async function apiFetchBlob(path: string, init?: RequestInit): Promise<Blob> {
  const response = await fetch(buildUrl(path), {
    ...init,
    headers: buildHeaders(init),
  });

  if (!response.ok) {
    const isJson = response.headers.get('content-type')?.includes('application/json');
    const errorBody = isJson ? await response.json().catch(() => undefined) : undefined;
    throw new ApiError(
      errorBody?.message ?? 'No se pudo descargar el archivo',
      response.status,
      errorBody?.error,
      errorBody,
    );
  }

  return response.blob();
}
