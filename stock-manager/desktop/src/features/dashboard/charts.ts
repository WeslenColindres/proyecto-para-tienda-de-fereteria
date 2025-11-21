import type { CategorySlice, ComparisonSeries, MonthlySale, WeeklySale } from '@/shared/types/dashboard';
import { numberFormatter } from '@/shared/utils/format';

type CanvasContextConfig = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
};

const prepareCanvas = (canvas: HTMLCanvasElement): CanvasContextConfig | null => {
  const width = canvas.clientWidth || canvas.width;
  const height = canvas.clientHeight || canvas.height;
  const dpr = window.devicePixelRatio || 1;

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);
  return { ctx, width, height };
};

const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
};

export const drawWeeklyBarChart = (canvas: HTMLCanvasElement, data: WeeklySale[]) => {
  const ctxConfig = prepareCanvas(canvas);
  if (!ctxConfig) return;
  const { ctx, width, height } = ctxConfig;
  const padding = 32;
  const chartHeight = height - padding * 2;
  const chartWidth = width - padding * 2;
  const maxValue = Math.max(...data.map((item) => item.amount)) || 1;
  const step = chartWidth / data.length;
  const barWidth = step * 0.5;

  data.forEach((item, index) => {
    const x = padding + index * step + (step - barWidth) / 2;
    const barHeight = (item.amount / maxValue) * chartHeight;
    const y = height - padding - barHeight;
    const radius = 8;
    ctx.fillStyle = '#3498db';
    drawRoundedRect(ctx, x, y, barWidth, barHeight, radius);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Manrope, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(item.label, x + barWidth / 2, height - padding + 16);
    ctx.fillText(numberFormatter.format(item.amount), x + barWidth / 2, y - 6);
  });
};

export const drawMonthlyLineChart = (canvas: HTMLCanvasElement, data: MonthlySale[]) => {
  const ctxConfig = prepareCanvas(canvas);
  if (!ctxConfig) return;
  const { ctx, width, height } = ctxConfig;
  const padding = 32;
  const chartHeight = height - padding * 2;
  const chartWidth = width - padding * 2;
  const maxValue = Math.max(...data.map((item) => item.amount)) * 1.1;
  const step = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth;

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  const points = data.map((item, idx) => {
    const x = padding + idx * step;
    const y = height - padding - (item.amount / maxValue) * chartHeight;
    return { x, y };
  });

  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 3;
  ctx.beginPath();
  points.forEach((point, idx) => {
    if (idx === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();

  ctx.fillStyle = '#2c3e50';
  ctx.font = '12px Manrope, system-ui, sans-serif';
  ctx.textAlign = 'center';
  data.forEach((item, idx) => {
    const x = padding + idx * step;
    ctx.fillText(item.label, x, height - padding + 16);
  });
};

export const drawComparisonChart = (canvas: HTMLCanvasElement, data: ComparisonSeries) => {
  const ctxConfig = prepareCanvas(canvas);
  if (!ctxConfig) return;
  const { ctx, width, height } = ctxConfig;
  const padding = 40;
  const chartHeight = height - padding * 2;
  const chartWidth = width - padding * 2;
  const maxValue = Math.max(...data.current, ...data.previous) * 1.1;
  const step = data.labels.length > 1 ? chartWidth / (data.labels.length - 1) : chartWidth;

  const toPoints = (values: number[]) =>
    values.map((value, idx) => {
      const x = padding + idx * step;
      const y = height - padding - (value / maxValue) * chartHeight;
      return { x, y, value };
    });

  const currentPoints = toPoints(data.current);
  const previousPoints = toPoints(data.previous);

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, height - padding);
  ctx.lineTo(width - padding, height - padding);
  ctx.stroke();

  const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
  gradient.addColorStop(0, 'rgba(44, 62, 80, 0.45)');
  gradient.addColorStop(1, 'rgba(44, 62, 80, 0.05)');

  ctx.beginPath();
  currentPoints.forEach((point, idx) => {
    if (idx === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.lineTo(currentPoints[currentPoints.length - 1].x, height - padding);
  ctx.lineTo(currentPoints[0].x, height - padding);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.strokeStyle = '#95a5a6';
  ctx.setLineDash([8, 6]);
  ctx.lineWidth = 3;
  ctx.beginPath();
  previousPoints.forEach((point, idx) => {
    if (idx === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = '#2c3e50';
  ctx.lineWidth = 4;
  ctx.beginPath();
  currentPoints.forEach((point, idx) => {
    if (idx === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();

  ctx.fillStyle = 'rgba(148, 163, 184, 0.85)';
  ctx.font = '12px Manrope, system-ui, sans-serif';
  ctx.textAlign = 'center';
  data.labels.forEach((label, idx) => {
    const x = padding + idx * step;
    ctx.fillText(label, x, height - padding + 20);
  });
};

export const drawDonutChart = (canvas: HTMLCanvasElement, slices: CategorySlice[], total: number) => {
  const ctxConfig = prepareCanvas(canvas);
  if (!ctxConfig) return;

  const { ctx, width, height } = ctxConfig;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 6;
  const lineWidth = radius * 0.45;
  let startAngle = -Math.PI / 2;

  slices.forEach((slice) => {
    const sliceAngle = (slice.amount / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.strokeStyle = slice.color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.arc(centerX, centerY, radius - lineWidth / 2, startAngle, startAngle + sliceAngle);
    ctx.stroke();
    startAngle += sliceAngle;
  });
};
