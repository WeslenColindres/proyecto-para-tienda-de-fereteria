export type SupplierStatus = 'activo' | 'inactivo' | 'moroso';

export type SupplierPurchaseStatus = 'pendiente' | 'pagado' | 'vencido';

export type SupplierItem = {
  id: string;
  nit: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  cityId: string;
  cityName?: string;
  categoryId: string;
  categoryName?: string;
  address?: string;
  status: SupplierStatus;
  balance: number;
  overdueDays: number;
  creditDays: number;
  creditLimit: number;
  lastPurchase?: string;
  lastDocument?: string;
  readonly createdAt?: string; // fecha_creacion
  readonly updatedAt?: string; // fecha_modificacion
};

export type SupplierPurchaseRow = {
  id: string;
  supplierId: string;
  date: string;
  documentNumber: string;
  amount: number;
  status: SupplierPurchaseStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type SupplierReportRow = {
  supplier: string;
  purchases: number;
  share: number;
  lastPurchase: string;
  state: string;
};

export type SupplierCatalogs = {
  cities: Array<{ id: string; name: string; country?: string }>;
  categories: Array<{ id: string; code: string; name: string; color?: string; status?: string }>;
};

export type SupplierListResponse = {
  data: SupplierItem[];
  total: number;
  page: number;
  pageSize: number;
  counters: Record<SupplierStatus, number>;
  filters: {
    search: string;
    status: SupplierStatus | 'all';
    cityId: string | 'all';
    categoryId: string | 'all';
  };
};

export type SupplierReportResponse = {
  rows: SupplierReportRow[];
  kpis: Array<{ label: string; value: string }>;
  totalAmount: number;
};
