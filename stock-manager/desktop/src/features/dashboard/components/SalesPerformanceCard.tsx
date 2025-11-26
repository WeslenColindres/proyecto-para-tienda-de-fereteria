// src/features/dashboard/components/SalesPerformanceCard.tsx
import { useEffect, useRef } from 'react';
import type { ChartView, DashboardData } from '@/shared/types/dashboard';
import { renderMonthlyTrendChart, renderWeeklySalesChart } from '../charts';

type SalesPerformanceCardProps = {
  chartView: ChartView;
  onChartViewChange: (view: ChartView) => void;
  weeklySales: DashboardData['weeklySales'];
  monthlySales: DashboardData['monthlySales'];
};

const SalesPerformanceCard = ({
  chartView,
  onChartViewChange,
  weeklySales,
  monthlySales,
}: SalesPerformanceCardProps) => {
  const mainChartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mainChartRef.current;
    if (!container) return;

    const destroyChart =
      chartView === 'week'
        ? renderWeeklySalesChart(container, weeklySales)
        : renderMonthlyTrendChart(container, monthlySales);

    return () => destroyChart?.();
  }, [chartView, weeklySales, monthlySales]);

  const today = new Date().toISOString().split('T')[0];

  return (
    <article className="card card-main-chart">
      <div className="card-header">
        <div>
          <h2 style={{ margin: 0, fontSize: 18 }}>Rendimiento de ventas</h2>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
            Escoge un rango para analizar el comportamiento diario
          </p>
        </div>
        <div className="chart-controls">
          <div className="toggle-group" role="group">
            <button
              type="button"
              data-chart-view="week"
              className={chartView === 'week' ? 'active' : ''}
              onClick={() => onChartViewChange('week')}
            >
              Semana
            </button>
            <button
              type="button"
              data-chart-view="month"
              className={chartView === 'month' ? 'active' : ''}
              onClick={() => onChartViewChange('month')}
            >
              Mes
            </button>
          </div>
          <label>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Fecha</span>
            <input type="date" className="date-filter" defaultValue={today} />
          </label>
        </div>
      </div>
      <div className="main-chart-graphic" id="main-chart">
        <div id="main-chart-surface" className="chart-surface" ref={mainChartRef}></div>
      </div>
    </article>
  );
};

export default SalesPerformanceCard;
