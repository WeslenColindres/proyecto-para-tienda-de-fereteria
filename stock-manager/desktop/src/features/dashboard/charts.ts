import uPlot from 'uplot';
import type { ComparisonSeries, MonthlySale, WeeklySale } from '@/shared/types/dashboard';
import { numberFormatter } from '@/shared/utils/format';

type Cleanup = () => void;

const ensureWidth = (container: HTMLDivElement) => {
  const rect = container.getBoundingClientRect();
  return Math.max(Math.floor(rect.width || container.clientWidth || 0), 320);
};

const createResponsiveChart = (
  container: HTMLDivElement,
  options: Omit<uPlot.Options, 'width'>,
  data: uPlot.AlignedData,
): Cleanup => {
  container.innerHTML = '';
  const height = options.height ?? 260;
  const chart = new uPlot(
    {
      ...options,
      width: ensureWidth(container),
      height,
      legend: options.legend ?? { show: false },
    },
    data,
    container,
  );

  const resizeObserver = new ResizeObserver((entries) => {
    const nextWidth = Math.max(Math.floor(entries[0].contentRect.width), 320);
    chart.setSize({ width: nextWidth, height });
  });

  resizeObserver.observe(container);

  return () => {
    resizeObserver.disconnect();
    chart.destroy();
    container.innerHTML = '';
  };
};

export const renderWeeklySalesChart = (container: HTMLDivElement, data: WeeklySale[]): Cleanup => {
  if (!data.length) {
    container.textContent = 'Sin datos';
    return () => {
      container.textContent = '';
    };
  }

  const labels = data.map((item) => item.label);
  const xValues = data.map((_, idx) => idx);
  const values = data.map((item) => item.amount);
  const maxValue = Math.max(...values, 0);

  return createResponsiveChart(
    container,
    {
      height: 260,
      padding: [12, 12, 16, 12],
      scales: {
        x: { time: false },
        y: {
          range: () => [0, maxValue > 0 ? maxValue * 1.15 : 1],
        },
      },
      axes: [
        {
          stroke: '#94a3b8',
          grid: { show: false },
          ticks: { show: false },
          values: () => labels,
          splits: () => xValues,
        },
        {
          stroke: '#94a3b8',
          grid: { stroke: 'rgba(148, 163, 184, 0.2)' },
          values: (_u, vals) => vals.map((v) => numberFormatter.format(v as number)),
        },
      ],
      series: [
        {},
        {
          label: 'Ventas',
          points: { show: false },
          stroke: '#4f8bff',
          fill: 'rgba(79, 139, 255, 0.35)',
          paths: uPlot.paths!.bars!({
            size: [0.6],
            gap: 10,
            radius: 10,
          }),
        },
      ],
      cursor: { drag: { x: false, y: false } },
    },
    [xValues, values],
  );
};

export const renderMonthlyTrendChart = (container: HTMLDivElement, data: MonthlySale[]): Cleanup => {
  if (!data.length) {
    container.textContent = 'Sin datos';
    return () => {
      container.textContent = '';
    };
  }

  const labels = data.map((item) => item.label);
  const xValues = data.map((_, idx) => idx);
  const values = data.map((item) => item.amount);
  const maxValue = Math.max(...values, 0);

  return createResponsiveChart(
    container,
    {
      height: 260,
      padding: [12, 12, 16, 12],
      scales: {
        x: { time: false },
        y: {
          range: () => [0, maxValue > 0 ? maxValue * 1.1 : 1],
        },
      },
      axes: [
        {
          stroke: '#94a3b8',
          grid: { show: false },
          ticks: { show: false },
          values: () => labels,
          splits: () => xValues,
        },
        {
          stroke: '#94a3b8',
          grid: { stroke: 'rgba(148, 163, 184, 0.2)' },
          values: (_u, vals) => vals.map((v) => numberFormatter.format(v as number)),
        },
      ],
      series: [
        {},
        {
          label: 'Tendencia',
          width: 3,
          stroke: '#2c3e50',
          fill: 'rgba(44, 62, 80, 0.12)',
          points: {
            show: true,
            size: 6,
            fill: '#2c3e50',
            stroke: '#2c3e50',
          },
        },
      ],
      cursor: { focus: { prox: 24 }, drag: { x: false, y: false } },
    },
    [xValues, values],
  );
};

export const renderMonthlyComparisonChart = (
  container: HTMLDivElement,
  data: ComparisonSeries,
): Cleanup => {
  if (!data.labels.length || !data.current.length || !data.previous.length) {
    container.textContent = 'Sin datos';
    return () => {
      container.textContent = '';
    };
  }

  const xValues = data.labels.map((_, idx) => idx);
  const maxValue = Math.max(...data.current, ...data.previous, 0);

  return createResponsiveChart(
    container,
    {
      height: 300,
      padding: [14, 10, 20, 10],
      scales: {
        x: { time: false },
        y: {
          range: () => [0, maxValue > 0 ? maxValue * 1.1 : 1],
        },
      },
      axes: [
        {
          stroke: '#94a3b8',
          grid: { show: false },
          ticks: { show: false },
          values: () => data.labels,
          splits: () => xValues,
        },
        {
          stroke: '#94a3b8',
          grid: { stroke: 'rgba(148, 163, 184, 0.2)' },
          values: (_u, vals) => vals.map((v) => numberFormatter.format(v as number)),
        },
      ],
      series: [
        {},
        {
          label: 'Mes actual',
          width: 3,
          stroke: '#2c3e50',
          fill: 'rgba(44, 62, 80, 0.14)',
          points: {
            show: true,
            size: 5,
            fill: '#2c3e50',
            stroke: '#2c3e50',
          },
        },
        {
          label: 'Mes anterior',
          width: 2,
          stroke: '#95a5a6',
          dash: [6, 4],
          points: { show: false },
        },
      ],
      cursor: { focus: { prox: 32 }, drag: { x: false, y: false } },
    },
    [xValues, data.current, data.previous],
  );
};
