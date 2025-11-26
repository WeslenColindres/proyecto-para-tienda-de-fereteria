// src/features/dashboard/DashboardView.tsx
import type { ChartView, DashboardData } from '@/shared/types/dashboard';

import KpiGrid from './components/KpiGrid';
import SalesPerformanceCard from './components/SalesPerformanceCard';
import CategorySalesCard from './components/CategorySalesCard';
import TopProductsCard from './components/TopProductsCard';
import MonthlyComparisonCard from './components/MonthlyComparisonCard';
import LastSalesTable from './components/LastSalesTable';
import LowStockTable from './components/LowStockTable';
import MovementsTable from './components/MovementsTable';
import UpdateStatusCard from './components/UpdateStatusCard';

type DashboardProps = {
  data: DashboardData;
  loading: boolean;
  error: string | null;
  chartView: ChartView;
  onChartViewChange: (view: ChartView) => void;
  updateLog: string[];
  onCheckUpdates?: () => void;
};

const DashboardView = ({
  data,
  loading,
  error,
  chartView,
  onChartViewChange,
  updateLog,
  onCheckUpdates,
}: DashboardProps) => {
  return (
    <main className="dashboard app-view is-visible" id="dashboard-view" data-app-view>
      {loading ? <div className="loading-banner">Cargando datos desde el backend...</div> : null}
      {error ? (
        <div className="loading-banner" id="dashboard-error">
          No se pudo cargar el dashboard: {error}
        </div>
      ) : null}

      {/* KPIs */}
      <section className="kpi-grid">
        <KpiGrid kpis={data.kpis} />
      </section>

      {/* Gráficos de ventas */}
      <section className="charts-grid">
        <SalesPerformanceCard
          chartView={chartView}
          onChartViewChange={onChartViewChange}
          weeklySales={data.weeklySales}
          monthlySales={data.monthlySales}
        />
        <div className="side-charts">
          <CategorySalesCard breakdown={data.categoryBreakdown} />
          <TopProductsCard products={data.topProducts} />
        </div>
      </section>

      {/* Comparativa mensual */}
      <section className="card comparison-card">
        <MonthlyComparisonCard comparison={data.comparison} />
      </section>

      {/* Tablas */}
      <section className="tables-grid">
        <LastSalesTable sales={data.lastSales} />
        <LowStockTable items={data.lowStock} />
        <MovementsTable movements={data.movements} />
      </section>

      {/* Auto-actualización */}
      <section className="card">
        <UpdateStatusCard updateLog={updateLog} onCheckUpdates={onCheckUpdates} />
      </section>
    </main>
  );
};

export default DashboardView;
