export type CustomerStatus = 'activo' | 'inactivo' | 'credito' | 'contado';

export type CustomerItem = {
  id: string;
  nit: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  type: 'persona-natural' | 'persona-juridica' | 'extranjero';
  hasCredit: boolean;
  creditLimit: number;
  creditUsed: number;
  discount: number;
  status: CustomerStatus;
};

export type CustomerSaleRow = {
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
