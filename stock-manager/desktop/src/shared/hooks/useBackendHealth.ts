import { useState, useEffect, useCallback } from 'react';
import { getApiBaseUrl } from '../api/httpClient';

interface BackendHealth {
    status: 'ok' | 'error' | 'unknown';
    services?: {
        websocket: {
            status: 'active' | 'inactive';
            connections: number;
        };
        database: {
            status: 'connected' | 'disconnected';
        };
    };
}

export function useBackendHealth() {
    const [isReady, setIsReady] = useState(false);
    const [health, setHealth] = useState<BackendHealth | null>(null);

    const checkHealth = useCallback(async () => {
        try {
            const response = await fetch(`${getApiBaseUrl()}/api/health`);
            if (response.ok) {
                const data = await response.json();
                setHealth(data);
                setIsReady(true);
                return true;
            }
        } catch (error) {
            console.warn('Backend not ready yet:', error);
        }
        setIsReady(false);
        return false;
    }, []);

    useEffect(() => {
        let mounted = true;
        let timeoutId: NodeJS.Timeout;

        const poll = async () => {
            if (!mounted) return;

            const ready = await checkHealth();

            if (!ready) {
                // Poll more frequently if not ready
                timeoutId = setTimeout(poll, 2000);
            } else {
                // Poll less frequently if ready, just to keep status updated
                timeoutId = setTimeout(poll, 30000);
            }
        };

        poll();

        return () => {
            mounted = false;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [checkHealth]);

    return { isReady, health, checkHealth };
}
