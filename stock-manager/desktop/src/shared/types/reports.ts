export type ReportId =
  | 'ventas-fecha'
  | 'ventas-producto'
  | 'ventas-cliente'
  | 'inventario-estado'
  | 'inventario-movimientos'
  | 'inventario-rotacion'
  | 'finan-ganancias'
  | 'finan-cobrar'
  | 'finan-pagar'
  | 'export-excel'
  | 'export-pdf'
  | 'export-email'
  | 'export-whatsapp';

export type ReportMenuItem = {
  id: ReportId;
  label: string;
  icon: string;
  badge?: string;
};

export type ReportMenuCategory = {
  id: string;
  label: string;
  icon: string;
  badge?: string;
  items: ReportMenuItem[];
};

export type ReportKpi = {
  id: string;
  label: string;
  value: string;
  helper?: string;
  trend?: string;
  tone?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  icon?: string;
};

export type ReportTableColumn = {
  id: string;
  label: string;
  align?: 'left' | 'right';
  width?: string;
};

export type ReportRow = Record<string, string | number>;

export type ReportView = {
  id: ReportId;
  title: string;
  subtitle: string;
  tag?: string;
  kpis: ReportKpi[];
  chart: {
    title: string;
    type: 'line' | 'bar' | 'area' | 'doughnut';
    description: string;
    hint?: string;
  };
  filters: string[];
  table: {
    columns: ReportTableColumn[];
    rows: ReportRow[];
    totals?: Record<string, string>;
  };
  actions: string[];
  exportHint?: string;
};

export type FavoriteReport = {
  id: ReportId;
  label: string;
  kpi: string;
  action?: string;
};

export type ScheduledReport = {
  id: string;
  label: string;
  frequency: 'diario' | 'semanal' | 'mensual';
  time: string;
  day?: string;
  date?: string;
  active: boolean;
  format: string[];
  recipients: string[];
};

export type SendHistory = {
  id: string;
  status: 'ok' | 'error';
  datetime: string;
  report: string;
  target: string;
  channel: 'email' | 'whatsapp' | 'excel' | 'pdf';
};
