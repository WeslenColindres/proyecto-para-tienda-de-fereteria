// src/features/dashboard/components/CategorySalesCard.tsx
import { useEffect, useRef } from 'react';
import type { DashboardData } from '@/shared/types/dashboard';
import { drawDonutChart } from '../charts/drawDonutChart';
import type { DonutSlice } from '../charts/drawDonutChart';

type CategorySalesCardProps = {
  breakdown: DashboardData['categoryBreakdown'];
};

const CategorySalesCard = ({ breakdown }: CategorySalesCardProps) => {
  const donutChartRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = donutChartRef.current;
    if (!canvas) return;
    if (!breakdown.length) return;

    // Adaptar breakdown → DonutSlice[]
    const slices: DonutSlice[] = breakdown.map((slice) => ({
      label: slice.label,
      value: slice.amount,
      color: slice.color,
    }));

    drawDonutChart(canvas, slices, {
      thickness: 0.45,
      padding: 2,
      startAngle: -Math.PI / 2,
      animate: true,
      animationDuration: 800,
      showLabels: false, // si quieres etiquetas dentro del aro, pon true
    });
  }, [breakdown]);

  const total = breakdown.reduce((sum, slice) => sum + slice.amount, 0) || 1;

  return (
    <article className="card circle-base">
      <header className="card-header" style={{ marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Ventas por categoria</h3>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Ultimos 30 dias</span>
      </header>
      <div className="donut-wrapper">
        <div className="donut-chart" id="category-donut">
          <canvas id="category-donut-canvas" className="donut-canvas" ref={donutChartRef} />
        </div>
        <div className="donut-legend" id="category-legend">
          {breakdown.map((slice) => {
            const percent = Math.round((slice.amount / total) * 100);

            return (
              <div className="legend-item fade-in" key={slice.label}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="legend-pill" style={{ background: slice.color }} />
                  {slice.label}
                </span>
                <strong>{percent}%</strong>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
};

export default CategorySalesCard;

