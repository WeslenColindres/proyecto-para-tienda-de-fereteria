export type CustomerStatus = 'activo' | 'inactivo' | 'credito' | 'contado';
export type CustomerType = 'persona-natural' | 'persona-juridica' | 'extranjero';

export type CustomerItem = {
  id: number;
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
  // Nuevos campos de negocio
  commercialName?: string;
  customerTypeId?: string;
  birthDate?: string;
  creditDays?: number;
  // Auditoría
  readonly registrationDate?: string;
  readonly lastPurchaseDate?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly deletedAt?: string | null;
};

export type CustomerSaleRow = {
  id?: number;
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

// Dirección de cliente
export type CustomerAddress = {
  id?: string;
  customerId: string;
  type: 'FISCAL' | 'ENTREGA' | 'FACTURACION';
  address: string;
  department?: string;
  municipality?: string;
  zone?: string;
  reference?: string;
  isDefault: boolean;
};

// Contacto de cliente
export type CustomerContact = {
  id?: string;
  customerId: string;
  name: string;
  position?: string;
  email?: string;
  phone?: string;
  type?: 'PRINCIPAL' | 'SECUNDARIO' | 'EMERGENCIA';
};
