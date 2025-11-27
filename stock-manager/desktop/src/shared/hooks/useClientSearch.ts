import { useState, useEffect, useCallback } from 'react';
import { clientsApi, ClientSearchResult } from '../api/clients';

export function useClientSearch(searchTerm: string, enabled: boolean = true) {
    const [clients, setClients] = useState<ClientSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled || !searchTerm || searchTerm.trim().length < 2) {
            setClients([]);
            return;
        }

        const timeoutId = setTimeout(async () => {
            setLoading(true);
            setError(null);

            try {
                const results = await clientsApi.search(searchTerm.trim());
                setClients(results);
            } catch (err: any) {
                setError(err.message || 'Error al buscar clientes');
                setClients([]);
            } finally {
                setLoading(false);
            }
        }, 300); // Debounce 300ms

        return () => clearTimeout(timeoutId);
    }, [searchTerm, enabled]);

    const clearResults = useCallback(() => {
        setClients([]);
        setError(null);
    }, []);

    return {
        clients,
        loading,
        error,
        clearResults,
    };
}
