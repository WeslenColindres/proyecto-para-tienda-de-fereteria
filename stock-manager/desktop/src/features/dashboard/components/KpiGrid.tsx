// src/features/dashboard/components/KpiGrid.tsx
import type { DashboardData } from '@/shared/types/dashboard';
import { formatCurrency } from '@/shared/utils/format';

type KpiGridProps = {
  kpis: DashboardData['kpis'];
};

const KpiGrid = ({ kpis }: KpiGridProps) => {
  return (
    <>
      {kpis.map((kpi) => {
        const valueText =
          typeof kpi.amount === 'number' && kpi.format !== 'text'
            ? formatCurrency(kpi.amount)
            : String(kpi.amount);

        return (
          <article
            key={kpi.id}
            className="kpi-card fade-in"
            style={{ ['--accent' as string]: kpi.accent }}
          >
            <div className="kpi-icon">{kpi.icon}</div>
            <div className="kpi-title">{kpi.title}</div>
            <div className="kpi-value">{valueText}</div>
            <div className="kpi-subvalue">{kpi.subValue}</div>
          </article>
        );
      })}
    </>
  );
};

export default KpiGrid;
