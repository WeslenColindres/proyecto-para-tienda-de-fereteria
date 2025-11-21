export type ChartView = 'week' | 'month';

export type KPICard = {
  id: string;
  title: string;
  amount: number | string;
  subValue: string;
  accent: string;
  icon: string;
  format?: 'currency' | 'text';
};

export type WeeklySale = { label: string; amount: number };
export type MonthlySale = { label: string; amount: number };
export type CategorySlice = { label: string; amount: number; color: string };
export type ProductSummary = { name: string; amount: number; units: number };
export type ComparisonSeries = { labels: string[]; current: number[]; previous: number[] };
export type SaleRow = { datetime: string; customer: string; document: string; total: number };
export type StockRow = { product: string; stock: number; min: number };
export type MovementRow = { product: string; type: 'in' | 'out'; qty: number; date: string };

export type DashboardData = {
  kpis: KPICard[];
  weeklySales: WeeklySale[];
  monthlySales: MonthlySale[];
  categoryBreakdown: CategorySlice[];
  topProducts: ProductSummary[];
  comparison: ComparisonSeries;
  lastSales: SaleRow[];
  lowStock: StockRow[];
  movements: MovementRow[];
};
