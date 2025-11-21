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
  async execute(): Promise<DashboardMetrics> {
    return {
      kpis: [
        {
          id: 'sales-day',
          title: 'Ventas del día',
          amount: 12450,
          subValue: '+12% vs ayer',
          accent: '#27ae60',
          icon: '📈',
          format: 'currency',
        },
        {
          id: 'sales-week',
          title: 'Ventas semana',
          amount: 87320,
          subValue: 'Objetivo 92%',
          accent: '#2dd4bf',
          icon: '📊',
          format: 'currency',
        },
        {
          id: 'sales-month',
          title: 'Ventas mes',
          amount: 324560,
          subValue: '+18% vs mes anterior',
          accent: '#3498db',
          icon: '📅',
          format: 'currency',
        },
        {
          id: 'invoices-day',
          title: 'Facturas del día',
          amount: '15 (60%)',
          subValue: 'Comprobantes: 10',
          accent: '#8b5cf6',
          icon: '📄',
          format: 'text',
        },
        {
          id: 'top-product',
          title: 'Top producto hoy',
          amount: 'Café Expresso',
          subValue: '125 unidades',
          accent: '#e74c3c',
          icon: '⭐',
          format: 'text',
        },
      ],
      weeklySales: [
        { label: 'Lun', amount: 18900 },
        { label: 'Mar', amount: 17450 },
        { label: 'Mié', amount: 20100 },
        { label: 'Jue', amount: 22300 },
        { label: 'Vie', amount: 25450 },
        { label: 'Sáb', amount: 16800 },
        { label: 'Dom', amount: 14250 },
      ],
      monthlySales: [
        { label: 'Jun', amount: 189000 },
        { label: 'Jul', amount: 208500 },
        { label: 'Ago', amount: 224100 },
        { label: 'Sep', amount: 248900 },
        { label: 'Oct', amount: 267300 },
        { label: 'Nov', amount: 324560 },
      ],
      categoryBreakdown: [
        { label: 'Bebidas', amount: 146052, color: '#3498db' },
        { label: 'Comida', amount: 113596, color: '#27ae60' },
        { label: 'Ferretería', amount: 50350, color: '#f39c12' },
        { label: 'Otros', amount: 14400, color: '#9b59b6' },
      ],
      topProducts: [
        { name: 'Café Expresso', amount: 12450, units: 125 },
        { name: 'Pan francés artesanal', amount: 8320, units: 98 },
        { name: 'Empanada mixta', amount: 7890, units: 87 },
        { name: 'Té chai helado', amount: 5600, units: 76 },
        { name: 'Jugos prensados', amount: 4200, units: 54 },
      ],
      comparison: {
        labels: ['1', '5', '10', '15', '20', '25', '30'],
        current: [12000, 22000, 35000, 48000, 62000, 78000, 94000],
        previous: [10000, 18000, 31000, 41000, 52000, 64000, 76000],
      },
      lastSales: [
        { datetime: '22/11 10:30', customer: 'Juan Ortiz', document: 'Fact-A001', total: 450 },
        { datetime: '22/11 10:25', customer: 'María López', document: 'Comp-A002', total: 120 },
        { datetime: '22/11 09:58', customer: 'Importadora Quesada', document: 'Fact-A003', total: 890 },
        { datetime: '22/11 09:31', customer: 'Carlos Gómez', document: 'Comp-A004', total: 210 },
        { datetime: '22/11 08:55', customer: 'Ferretería Central', document: 'Fact-A005', total: 1640 },
      ],
      lowStock: [
        { product: 'Café molido 500g', stock: 15, min: 20 },
        { product: 'Azúcar estándar 1kg', stock: 8, min: 15 },
        { product: 'Leche deslactosada', stock: 3, min: 10 },
        { product: 'Bolsas kraft M', stock: 26, min: 30 },
      ],
      movements: [
        { product: 'Café molido 500g', type: 'out', qty: 5, date: '22/11' },
        { product: 'Pan francés', type: 'in', qty: 10, date: '22/11' },
        { product: 'Azúcar estándar 1kg', type: 'out', qty: 2, date: '22/11' },
        { product: 'Leche deslactosada', type: 'out', qty: 1, date: '22/11' },
        { product: 'Empanada mixta', type: 'in', qty: 8, date: '21/11' },
      ],
    };
  }
}
