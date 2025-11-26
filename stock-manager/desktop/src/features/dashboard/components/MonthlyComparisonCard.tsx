// src/features/dashboard/components/MonthlyComparisonCard.tsx
import { useEffect, useRef } from 'react';
import type { DashboardData } from '@/shared/types/dashboard';
import { renderMonthlyComparisonChart } from '../charts';

type MonthlyComparisonCardProps = {
  comparison: DashboardData['comparison'];
};

const MonthlyComparisonCard = ({ comparison }: MonthlyComparisonCardProps) => {
  const comparisonChartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = comparisonChartRef.current;
    if (!container) return;
    const destroyChart = renderMonthlyComparisonChart(container, comparison);
    return () => destroyChart?.();
  }, [comparison]);

  return (
    <>
      <div className="card-header">
        <div>
          <h3 style={{ margin: 0, fontSize: 18 }}>Comparativa mensual</h3>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
            Mes actual vs mes anterior
          </p>
        </div>
      </div>
      <div className="comparison-legend">
        <span>
          <span className="legend-dot current"></span> Mes actual
        </span>
        <span>
          <span className="legend-dot previous"></span> Mes anterior
        </span>
      </div>
      <div className="card-body" id="comparison-chart">
        <div id="comparison-chart-surface" className="comparison-chart" ref={comparisonChartRef}></div>
      </div>
    </>
  );
};

export default MonthlyComparisonCard;
