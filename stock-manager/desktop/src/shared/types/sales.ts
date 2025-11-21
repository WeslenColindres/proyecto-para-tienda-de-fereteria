export type SaleDocumentType = 'FACTURA' | 'FACTURA_NUEVO' | 'COMPROBANTE';

export type SaleSearchResult = {
  id: string;
  name: string;
  code: string;
  price: number;
  stock: number;
  stockState: 'ok' | 'low' | 'critical';
};

export type SaleCartItem = {
  id: string;
  name: string;
  code: string;
  qty: number;
  price: number;
  discountPct: number;
  subtotal: number;
  editable?: boolean;
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
  message: string;
  status: 'registrado' | 'nuevo' | 'consumidor-final';
};

export type SalePaymentSummary = {
  subtotal: number;
  tax: number;
  total: number;
  paidWith: number;
  change: number;
  method: string;
  suggestions: number[];
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
  type: SaleDocumentType;
  client: string;
  total: number;
  user: string;
  status: 'pagada' | 'pendiente' | 'anulada';
  date: string;
  channel?: string;
  time?: string;
};
