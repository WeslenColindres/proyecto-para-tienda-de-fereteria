export type SupplierStatus = 'activo' | 'inactivo' | 'moroso';

export type SupplierPurchaseStatus = 'pendiente' | 'pagado' | 'vencido';

export type SupplierItem = {
  id: string;
  nit: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  city: string;
  category: string;
  status: SupplierStatus;
  balance: number;
  overdueDays: number;
  creditDays: number;
  creditLimit: number;
  lastPurchase: string;
  lastDocument: string;
};

export type SupplierPurchaseRow = {
  date: string;
  document: string;
  amount: number;
  status: SupplierPurchaseStatus;
};

export type SupplierReportRow = {
  supplier: string;
  purchases: number;
  share: number;
  lastPurchase: string;
  state: string;
};
