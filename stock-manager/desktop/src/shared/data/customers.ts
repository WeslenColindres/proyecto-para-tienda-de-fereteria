import type { CustomerCreditRow, CustomerItem, CustomerSaleRow } from '../types/customers';

export const CUSTOMERS: CustomerItem[] = [
  {
    id: 'cli-001',
    nit: '784512-3',
    name: 'Juan Perez',
    phone: '5555-1234',
    email: 'jperez@mail.com',
    city: 'Ciudad Capital',
    type: 'persona-natural',
    hasCredit: true,
    creditLimit: 8500,
    creditUsed: 8500,
    discount: 5,
    status: 'credito'
  },
  {
    id: 'cli-002',
    nit: '965874-1',
    name: 'Maria Garcia',
    phone: '5555-5678',
    email: 'maria@mail.com',
    city: 'Mixco',
    type: 'persona-natural',
    hasCredit: true,
    creditLimit: 5000,
    creditUsed: 2100,
    discount: 3,
    status: 'activo'
  },
  {
    id: 'cli-003',
    nit: '223344-5',
    name: 'Distribuciones Luna',
    phone: '5566-7788',
    email: 'facturacion@luna.com',
    city: 'Antigua',
    type: 'persona-juridica',
    hasCredit: true,
    creditLimit: 12000,
    creditUsed: 3400,
    discount: 4,
    status: 'credito'
  },
  {
    id: 'cli-004',
    nit: 'CF',
    name: 'Consumidor Final',
    phone: '0000-0000',
    email: 'na',
    city: 'Ciudad Capital',
    type: 'persona-natural',
    hasCredit: false,
    creditLimit: 0,
    creditUsed: 0,
    discount: 0,
    status: 'contado'
  },
  {
    id: 'cli-005',
    nit: '770011-4',
    name: 'Carlos Ruiz',
    phone: '5021-7788',
    email: 'cruiz@contacto.com',
    city: 'Quetzaltenango',
    type: 'extranjero',
    hasCredit: false,
    creditLimit: 0,
    creditUsed: 0,
    discount: 2,
    status: 'activo'
  }
];

export const CUSTOMER_SALES: CustomerSaleRow[] = [
  { date: '22/11/2024', document: 'FACT-112', amount: 850, type: 'credito', status: 'pendiente' },
  { date: '21/11/2024', document: 'FACT-111', amount: 1200, type: 'contado', status: 'pagado' },
  { date: '20/11/2024', document: 'FACT-110', amount: 650, type: 'contado', status: 'pagado' },
  { date: '18/11/2024', document: 'FACT-109', amount: 1420, type: 'credito', status: 'vencido' },
  { date: '17/11/2024', document: 'FACT-108', amount: 980, type: 'cuotas', status: 'pendiente' }
];

export const CUSTOMER_CREDIT_REPORT: CustomerCreditRow[] = [
  { customer: 'Juan Perez', limit: 8500, used: 8500, available: 0, daysToDue: -5 },
  { customer: 'Maria Garcia', limit: 5000, used: 2100, available: 2900, daysToDue: 20 },
  { customer: 'Distribuciones Luna', limit: 12000, used: 3400, available: 8600, daysToDue: 35 }
];
