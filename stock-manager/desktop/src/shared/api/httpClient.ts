import { ApiError } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

const resolveBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const desktopBase = (window as any)?.stockManager?.apiBaseUrl;
    if (desktopBase) return String(desktopBase).replace(/\/$/, '');
  }
  return API_BASE_URL.replace(/\/$/, '');
};

// Construye cabeceras seguras para cada request
const buildHeaders = (init?: RequestInit) => {
  const headers = new Headers(init?.headers as any);
  const isFormData = init?.body instanceof FormData;

  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Header de seguridad: identifica que la petición viene de la App Desktop
  headers.set('X-Source-App', 'stock-manager-desktop');

  return headers;
};

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${resolveBaseUrl()}${path}`, {
    ...init,
    headers: buildHeaders(init),
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await response.json().catch(() => undefined) : undefined;

  if (!response.ok) {
    throw new ApiError(body?.message ?? 'Error en la solicitud', response.status, body?.error, body);
  }

  return body as T;
}

export async function apiFetchBlob(path: string, init?: RequestInit): Promise<Blob> {
  const response = await fetch(`${resolveBaseUrl()}${path}`, {
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

export { API_BASE_URL };
