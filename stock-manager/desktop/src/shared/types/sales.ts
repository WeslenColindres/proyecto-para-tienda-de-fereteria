export type SaleDocumentType = 'FACTURA' | 'FACTURA_NUEVO' | 'COMPROBANTE';
export type SaleStatus = 'pagada' | 'pendiente' | 'anulada';

export type SaleSearchResult = {
  id: string;
  name: string;
  code: string;
  price: number;
  stock: number;
  minStock?: number;
  stockState: 'ok' | 'low' | 'critical';
};

export type SaleCartItem = {
  id?: string;
  productId: string;
  name: string;
  code: string;
  qty: number;
  price: number;
  discountPct?: number;
  subtotal: number;
  stock?: number;
  note?: string;
};

export type SaleStatusInfo = {
  pos: string;
  user: string;
  shift: string;
  document: string;
};

export type SaleClientInfo = {
  nit: string;
  name: string;
  phone?: string;
  address?: string;
  documentType: SaleDocumentType;
  message?: string;
  status: 'registrado' | 'nuevo' | 'consumidor-final';
};

export type SalePaymentSummary = {
  subtotal: number;
  tax: number;
  total: number;
  paidWith: number;
  change: number;
  method: string;
  suggestions?: number[];
};

export type SaleItem = {
  productId: string;
  code: string;
  name: string;
  qty: number;
  price: number;
  subtotal: number;
};

export type SaleDetail = {
  id: string;
  docNumber: string;
  docType: SaleDocumentType;
  datetime: string;
  clientName: string;
  clientNit: string;
  user: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: SaleStatus;
};

export type SaleListResponse = {
  data: SaleDetail[];
  total: number;
  page: number;
  pageSize: number;
};

export type SaleKpi = {
  id: string;
  title: string;
  value: string;
  subValue: string;
};

export type SaleRow = {
  id: string;
  docNumber: string;
  type: string; // 'FACTURA', 'COMPROBANTE', etc.
  client: string;
  total: number;
  user: string;
  status: string; // 'pagada', 'pendiente', 'anulada', etc.
  date: string; // '22/11 10:30'
  channel: string; // 'Mostrador', 'Online', ...
  time: string; // '2m 45s'
  originDocument?: string;
  reason?: string;
};
