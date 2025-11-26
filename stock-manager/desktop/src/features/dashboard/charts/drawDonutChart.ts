export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

export interface DonutChartOptions {
  thickness?: number; // Porcentaje del radio (0.3 = 30%)
  padding?: number; // Espacio entre slices en grados
  startAngle?: number; // Ángulo inicial en radianes
  animate?: boolean; // Activar animación
  animationDuration?: number; // Duración en ms
  showLabels?: boolean; // Mostrar etiquetas
  labelFormatter?: (slice: DonutSlice, percentage: number) => string;
}

const defaultOptions: Required<DonutChartOptions> = {
  thickness: 0.45,
  padding: 2,
  startAngle: -Math.PI / 2,
  animate: false,
  animationDuration: 800,
  showLabels: false,
  labelFormatter: (slice, percentage) =>
    `${slice.label}: ${slice.value} (${percentage.toFixed(1)}%)`,
};

export const prepareCanvas = (canvas: HTMLCanvasElement) => {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform por si acaso
  ctx.scale(dpr, dpr);

  return { ctx, width: rect.width, height: rect.height };
};

export const drawDonutChart = (
  canvas: HTMLCanvasElement,
  slices: DonutSlice[],
  options: DonutChartOptions = {},
) => {
  const ctxConfig = prepareCanvas(canvas);
  if (!ctxConfig || !slices.length) return;

  const { ctx, width, height } = ctxConfig;
  const opts = { ...defaultOptions, ...options };

  const total = slices.reduce((sum, s) => sum + s.value, 0);

  // Si no hay datos, limpiamos y salimos
  if (total <= 0) {
    ctx.clearRect(0, 0, width, height);
    return;
  }

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - opts.padding * 2;
  const lineWidth = radius * opts.thickness;

  let startAngle = opts.startAngle;
  const paddingRad = (opts.padding * Math.PI) / 180;

  const drawSlice = (slice: DonutSlice, progress = 1) => {
    const sliceAngle = (slice.value / total) * Math.PI * 2 * progress;

    if (sliceAngle <= 0) return;

    ctx.beginPath();
    ctx.strokeStyle = slice.color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';

    const arcStart = startAngle;
    const arcEnd = startAngle + sliceAngle - paddingRad;

    ctx.arc(centerX, centerY, radius - lineWidth / 2, arcStart, arcEnd);
    ctx.stroke();

    // Dibujar label si es necesario (solo al final de la animación)
    if (opts.showLabels && progress === 1) {
      const labelAngle = arcStart + sliceAngle / 2;
      const labelRadius = radius - lineWidth / 2;
      const labelX = centerX + Math.cos(labelAngle) * labelRadius;
      const labelY = centerY + Math.sin(labelAngle) * labelRadius;

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const percentage = (slice.value / total) * 100;
      ctx.fillText(opts.labelFormatter(slice, percentage), labelX, labelY);
    }

    startAngle += sliceAngle + paddingRad;
  };

  if (opts.animate) {
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min(1, (timestamp - startTime) / opts.animationDuration);

      ctx.clearRect(0, 0, width, height);
      startAngle = opts.startAngle;

      slices.forEach((slice) => drawSlice(slice, progress));

      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  } else {
    ctx.clearRect(0, 0, width, height);
    startAngle = opts.startAngle;
    slices.forEach((slice) => drawSlice(slice, 1));
  }
};
