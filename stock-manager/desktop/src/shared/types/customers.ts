export type CustomerStatus = 'activo' | 'inactivo' | 'credito' | 'contado';
export type CustomerType = 'persona-natural' | 'persona-juridica' | 'extranjero';

export type CustomerItem = {
  id: string;
  nit: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  type: CustomerType;
  hasCredit: boolean;
  creditLimit: number;
  creditUsed: number;
  discount: number;
  status: CustomerStatus;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
};

export type CustomerSaleRow = {
  id?: string;
  customerId?: string;
  date: string;
  document: string;
  amount: number;
  type: 'contado' | 'credito' | 'cuotas';
  status: 'pagado' | 'pendiente' | 'vencido';
};

export type CustomerCreditRow = {
  customer: string;
  limit: number;
  used: number;
  available: number;
  daysToDue: number;
};

export type CustomerListResponse = {
  data: CustomerItem[];
  total: number;
  page: number;
  pageSize: number;
};
