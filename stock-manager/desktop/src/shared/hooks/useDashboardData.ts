import { useEffect, useState } from 'react';
import { SAMPLE_DASHBOARD_DATA } from '../data/dashboard';
import type { DashboardData } from '../types/dashboard';

const getDashboardEndpoint = () => {
  const apiBase = (window.stockManager?.apiBaseUrl ?? 'http://localhost:4000').replace(/\/$/, '');
  return `${apiBase}/api/dashboard`;
};

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const endpoint = getDashboardEndpoint();
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`Backend respondio ${response.status}`);
        const payload = (await response.json()) as DashboardData;
        setData(payload);
      } catch (err) {
        console.error('[Dashboard] Error cargando datos', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setData(SAMPLE_DASHBOARD_DATA);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard().catch(() => undefined);
  }, []);

  return { data: data ?? SAMPLE_DASHBOARD_DATA, error, loading };
};
