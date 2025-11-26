import type {
  SaleCartItem,
  SaleClientInfo,
  SaleKpi,
  SalePaymentSummary,
  SaleRow,
  SaleSearchResult,
  SaleStatusInfo
} from '../types/sales';

export const SALE_STATUS_BAR: SaleStatusInfo = {
  pos: 'Caja 1',
  user: 'Juan Pérez',
  shift: 'Mañana',
  document: 'FAC-001-001'
};

export const PDV_SEARCH_RESULTS: SaleSearchResult[] = [
  { id: 'sr-1', name: 'Cafe Espresso', code: 'P001', price: 25, stock: 15, stockState: 'ok' },
  { id: 'sr-2', name: 'Pan Frances', code: 'P002', price: 8, stock: 8, stockState: 'low' },
  { id: 'sr-3', name: 'Empanada de Pollo', code: 'P003', price: 12, stock: 25, stockState: 'ok' },
  { id: 'sr-4', name: 'Cafe Americano', code: 'P004', price: 18, stock: 10, stockState: 'ok' },
  { id: 'sr-5', name: 'Chocolate caliente', code: 'P005', price: 20, stock: 3, stockState: 'critical' }
];

export const PDV_CART_ITEMS: SaleCartItem[] = [
  {
    id: 'c-1',
    productId: 'p001',
    name: 'Cafe Espresso',
    code: 'P001',
    qty: 2,
    price: 25,
    discountPct: 0,
    subtotal: 50,
  },
  {
    id: 'c-2',
    productId: 'p002',
    name: 'Pan Frances',
    code: 'P002',
    qty: 3,
    price: 8,
    discountPct: 5,
    subtotal: 22.8,
    note: 'Promo -5%',
  },
];

export const PDV_CLIENT_INFO: SaleClientInfo = {
  nit: '784512-3',
  name: 'Juan Perez',
  phone: '+502 3355 1122',
  documentType: 'FACTURA',
  message: 'Cliente registrado y valido',
  status: 'registrado'
};

export const PDV_PAYMENT_SUMMARY: SalePaymentSummary = {
  subtotal: 72.8,
  tax: 8.74,
  total: 81.54,
  paidWith: 100,
  change: 18.46,
  method: 'Efectivo',
  suggestions: [100, 200, 500]
};

export const SALES_KPIS: SaleKpi[] = [
  { id: 'hoy', title: 'Ventas hoy', value: '23 docs', subValue: 'Q45,230' },
  { id: 'ticket', title: 'Ticket promedio', value: 'Q452.30', subValue: 'vs ayer +4%' },
  { id: 'credito', title: 'Ventas a credito', value: '8 docs', subValue: 'Q12,450' },
  { id: 'reimpresiones', title: 'Reimpresiones', value: '5 tickets', subValue: 'Ultimas 24h' }
];

export const SALES_LIST: SaleRow[] = [
  {
    id: 'sale-1',
    docNumber: 'FAC-112',
    type: 'FACTURA',
    client: 'Juan Perez',
    total: 850,
    user: 'juan.p',
    status: 'pagada',
    date: '22/11 10:30',
    channel: 'Mostrador',
    time: '2m 45s',
    originDocument: 'FAC-090',
    reason: 'Producto defectuoso'
  },
  {
    id: 'sale-2',
    docNumber: 'CCF-113',
    type: 'COMPROBANTE',
    client: 'Consumidor Final',
    total: 45,
    user: 'ana.g',
    status: 'pagada',
    date: '22/11 09:58',
    channel: 'Mostrador',
    time: '1m 10s',
    originDocument: 'FAC-084',
    reason: 'Otros'
  },
  {
    id: 'sale-3',
    docNumber: 'FAC-111',
    type: 'FACTURA',
    client: 'Maria Garcia',
    total: 1200,
    user: 'juan.p',
    status: 'pendiente',
    date: '21/11 17:40',
    channel: 'Online',
    time: '3m 20s',
    originDocument: 'FAC-077',
    reason: 'Error en cobro'
  },
  {
    id: 'sale-4',
    docNumber: 'FAC-110',
    type: 'FACTURA',
    client: 'Constructora Atlas',
    total: 3450,
    user: 'supervisor.ana',
    status: 'anulada',
    date: '21/11 16:10',
    channel: 'Mostrador',
    time: '4m 02s',
    originDocument: 'FAC-060',
    reason: 'Producto defectuoso'
  }
];
