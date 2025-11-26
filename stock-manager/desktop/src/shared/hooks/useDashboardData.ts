import { useEffect, useState } from 'react';
import { SAMPLE_DASHBOARD_DATA } from '../data/dashboard';
import type { DashboardData } from '../types/dashboard';
import { apiFetch } from '../api/httpClient';
import { ApiError } from '../api/types';
import { ErrorLogger } from '../utils/errorLogger';

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const payload = await apiFetch<DashboardData>('/api/dashboard');
        setData(payload);
      } catch (err) {
        if (err instanceof ApiError) {
          ErrorLogger.logApiError(err, '/api/dashboard');
        } else if (err instanceof Error) {
          ErrorLogger.log(err, { scope: 'dashboard' });
        }
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
