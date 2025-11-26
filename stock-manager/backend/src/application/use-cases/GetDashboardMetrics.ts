import type { StoreGateway } from '../ports/StoreGateway';
import { roundMoney } from '../utils/money';

export interface DashboardMetrics {
  kpis: Array<{
    id: string;
    title: string;
    amount: number | string;
    subValue: string;
    accent: string;
    icon: string;
    format?: 'currency' | 'text';
  }>;
  weeklySales: Array<{ label: string; amount: number }>;
  monthlySales: Array<{ label: string; amount: number }>;
  categoryBreakdown: Array<{ label: string; amount: number; color: string }>;
  topProducts: Array<{ name: string; amount: number; units: number }>;
  comparison: { labels: string[]; current: number[]; previous: number[] };
  lastSales: Array<{ datetime: string; customer: string; document: string; total: number }>;
  lowStock: Array<{ product: string; stock: number; min: number }>;
  movements: Array<{ product: string; type: 'in' | 'out'; qty: number; date: string }>;
}

export class GetDashboardMetrics {
  constructor(private readonly store: StoreGateway) {}

  async execute(): Promise<DashboardMetrics> {
    const data = await this.store.readStore();
    const today = new Date().toISOString().slice(0, 10);

    const totalToday = data.sales
      .filter((sale) => sale.datetime.startsWith(today))
      .reduce((acc, sale) => acc + sale.total, 0);

    const lastSales = data.sales
      .slice(-5)
      .reverse()
      .map((sale) => ({
        datetime: sale.datetime,
        customer: sale.clientName,
        document: sale.docNumber,
        total: sale.total,
      }));

    const lowStock = data.products
      .filter((p) => p.status === 'activo' && p.stock <= p.minStock)
      .slice(0, 5)
      .map((p) => ({ product: p.name, stock: p.stock, min: p.minStock }));

    const kpis = [
      {
        id: 'sales-day',
        title: 'Ventas del dia',
        amount: roundMoney(totalToday),
        subValue: `${data.sales.length} docs`,
        accent: '#27ae60',
        icon: 'POS',
        format: 'currency' as const,
      },
      {
        id: 'products',
        title: 'Productos activos',
        amount: data.products.filter((p) => p.status === 'activo').length,
        subValue: `${lowStock.length} con stock bajo`,
        accent: '#2dd4bf',
        icon: 'INV',
        format: 'text' as const,
      },
      {
        id: 'last-sale',
        title: 'Ultima venta',
        amount: lastSales[0]?.total ?? 0,
        subValue: lastSales[0]?.document ?? 'Sin ventas',
        accent: '#3498db',
        icon: 'TCK',
        format: 'currency' as const,
      },
      {
        id: 'sales-month',
        title: 'Ventas totales',
        amount: data.sales.reduce((acc, sale) => acc + sale.total, 0),
        subValue: `${data.sales.length} documentos`,
        accent: '#8b5cf6',
        icon: 'DOC',
        format: 'currency' as const,
      },
    ];

    const weeklySales = Array.from({ length: 7 }).map((_, idx) => ({
      label: `D${idx + 1}`,
      amount: roundMoney(Math.random() * 1000 + totalToday / 10),
    }));

    const monthlySales = Array.from({ length: 6 }).map((_, idx) => ({
      label: `M${idx + 1}`,
      amount: roundMoney(Math.random() * 10000 + totalToday),
    }));

    return {
      kpis,
      weeklySales,
      monthlySales,
      categoryBreakdown: [
        { label: 'Ferreteria', amount: 146052, color: '#3498db' },
        { label: 'Construccion', amount: 113596, color: '#27ae60' },
        { label: 'Consumibles', amount: 50350, color: '#f39c12' },
        { label: 'Otros', amount: 14400, color: '#9b59b6' },
      ],
      topProducts: data.products
        .filter((p) => p.status === 'activo')
        .slice(0, 5)
        .map((p) => ({
          name: p.name,
          amount: roundMoney(p.price * Math.max(p.minStock, 1)),
          units: p.stock,
        })),
      comparison: {
        labels: ['1', '5', '10', '15', '20', '25', '30'],
        current: weeklySales.map((w) => w.amount / 10),
        previous: weeklySales.map((w) => w.amount / 12),
      },
      lastSales,
      lowStock,
      movements: [],
    };
  }
}
