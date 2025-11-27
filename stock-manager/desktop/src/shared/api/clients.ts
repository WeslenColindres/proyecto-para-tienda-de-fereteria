import { apiFetch } from './httpClient';

export interface ClientSearchResult {
    id: number;
    nit: string;
    name: string;
    tradeName?: string;
    phone?: string;
    email?: string;
}

export interface CreateClientPayload {
    nit: string;
    name: string;
    tradeName?: string;
    phone?: string;
    email?: string;
}

export const clientsApi = {
    /**
     * Search clients by name or NIT
     */
    search: (query: string, limit: number = 10) =>
        apiFetch<ClientSearchResult[]>(`/api/clients/search?q=${encodeURIComponent(query)}&limit=${limit}`),

    /**
     * Get client by NIT
     */
    getByNit: (nit: string) =>
        apiFetch<ClientSearchResult>(`/api/clients/nit/${encodeURIComponent(nit)}`),

    /**
     * Create new client
     */
    create: (payload: CreateClientPayload) =>
        apiFetch<ClientSearchResult>('/api/clients', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),
};
