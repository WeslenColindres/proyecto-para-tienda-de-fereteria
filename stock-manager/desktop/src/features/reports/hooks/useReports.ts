import { useState, useEffect, useCallback } from 'react';
import { ReportId } from '@/shared/types/reports';

const API_URL = 'http://localhost:4000/api/reports';

export const useReports = (selectedReport: ReportId, dateRange: { start: string; end: string }) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchReportData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let endpoint = '';
            let queryParams = new URLSearchParams();

            switch (selectedReport) {
                case 'ventas-fecha':
                    endpoint = '/sales/daily';
                    queryParams.append('startDate', dateRange.start);
                    queryParams.append('endDate', dateRange.end);
                    break;
                case 'ventas-producto':
                    endpoint = '/products/top';
                    queryParams.append('limit', '50');
                    break;
                case 'inventario-estado':
                    endpoint = '/inventory/valuation';
                    break;
                case 'inventario-movimientos':
                    endpoint = '/inventory/movements';
                    queryParams.append('limit', '100');
                    break;
                case 'finan-ganancias':
                    endpoint = '/finance/summary';
                    break;
                case 'finan-cobrar':
                    endpoint = '/finance/receivables';
                    break;
                default:
                    // For other reports, we might not have a direct endpoint yet, or they are static/mocked for now
                    // We can return empty or keep the mock data in the view if needed.
                    // For now, let's try to fetch if it maps to something, or just stop.
                    setLoading(false);
                    return;
            }

            const response = await fetch(`${API_URL}${endpoint}?${queryParams.toString()}`);
            if (!response.ok) {
                throw new Error(`Error fetching report: ${response.statusText}`);
            }
            const result = await response.json();
            setData(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [selectedReport, dateRange]);

    useEffect(() => {
        fetchReportData();
    }, [fetchReportData]);

    return { data, loading, error, refetch: fetchReportData };
};
