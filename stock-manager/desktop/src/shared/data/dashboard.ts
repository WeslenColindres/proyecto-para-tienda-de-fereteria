import type { DashboardData } from '../types/dashboard';

export const SAMPLE_DASHBOARD_DATA: DashboardData = {
  kpis: [
    { id: 'ventas', title: 'Ventas del dia', amount: 15230, subValue: '+12% vs ayer', accent: '#2ecc71', icon: '[V]' },
    { id: 'tickets', title: 'Tickets', amount: 238, subValue: 'Prom. Q64', accent: '#3498db', icon: '[TKT]' },
    { id: 'clientes', title: 'Clientes', amount: 182, subValue: '18 nuevos', accent: '#9b59b6', icon: '[CL]' },
    { id: 'stock-bajo', title: 'Stock bajo', amount: 12, subValue: '8% inventario', accent: '#e67e22', icon: '[ST]', format: 'text' }
  ],
  weeklySales: [
    { label: 'Lun', amount: 1200 },
    { label: 'Mar', amount: 1800 },
    { label: 'Mie', amount: 1600 },
    { label: 'Jue', amount: 2200 },
    { label: 'Vie', amount: 3100 },
    { label: 'Sab', amount: 2800 },
    { label: 'Dom', amount: 1400 }
  ],
  monthlySales: [
    { label: 'Semana 1', amount: 8200 },
    { label: 'Semana 2', amount: 9100 },
    { label: 'Semana 3', amount: 9700 },
    { label: 'Semana 4', amount: 10300 }
  ],
  categoryBreakdown: [
    { label: 'Bebidas', amount: 15320, color: '#2ecc71' },
    { label: 'Panaderia', amount: 9200, color: '#3498db' },
    { label: 'Snacks', amount: 6300, color: '#9b59b6' }
  ],
  topProducts: [
    { name: 'Cafe Espresso', amount: 3750, units: 150 },
    { name: 'Pan Frances', amount: 640, units: 80 },
    { name: 'Empanada Pollo', amount: 960, units: 120 },
    { name: 'Te Earl Grey', amount: 450, units: 30 },
    { name: 'Jugos Naturales', amount: 540, units: 30 }
  ],
  comparison: {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    current: [12000, 14000, 13500, 15000, 16500, 17200],
    previous: [10000, 12000, 11800, 12500, 13000, 14200]
  },
  lastSales: [
    { datetime: '22/11 10:30', customer: 'Cafe Express', document: 'F-1201', total: 250 },
    { datetime: '22/11 10:21', customer: 'Panaderia Luz', document: 'F-1200', total: 480 },
    { datetime: '22/11 10:10', customer: 'Cliente POS', document: 'F-1199', total: 160 }
  ],
  lowStock: [
    { product: 'Cacao Premium', stock: 3, min: 8 },
    { product: 'Pan Frances', stock: 8, min: 5 },
    { product: 'Jugos Naturales', stock: 12, min: 6 }
  ],
  movements: [
    { product: 'Cafe Espresso', type: 'out', qty: 5, date: '22/11 10:30' },
    { product: 'Pan Frances', type: 'in', qty: 20, date: '22/11 10:25' },
    { product: 'Empanada', type: 'out', qty: 2, date: '22/11 10:20' }
  ]
};
