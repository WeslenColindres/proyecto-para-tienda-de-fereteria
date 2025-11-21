import type { SupplierItem, SupplierPurchaseRow, SupplierReportRow } from '../types/suppliers';

export const SUPPLIERS: SupplierItem[] = [
  {
    id: 'sup-001',
    nit: '123456-7',
    name: 'Proveedor ABC',
    contact: 'Juan Perez',
    phone: '5555-1234',
    email: 'compras@abc.com',
    city: 'Ciudad Capital',
    category: 'Alimentos',
    status: 'moroso',
    balance: 12450,
    overdueDays: 42,
    creditDays: 30,
    creditLimit: 50000,
    lastPurchase: '22/11/2024',
    lastDocument: 'COM-112'
  },
  {
    id: 'sup-002',
    nit: '987654-3',
    name: 'Distribuidora XYZ',
    contact: 'Maria Gomez',
    phone: '5555-7890',
    email: 'ventas@xyz.com',
    city: 'Ciudad Gt',
    category: 'Ferreteria',
    status: 'activo',
    balance: 0,
    overdueDays: 0,
    creditDays: 20,
    creditLimit: 32000,
    lastPurchase: '20/11/2024',
    lastDocument: 'COM-111'
  },
  {
    id: 'sup-003',
    nit: '447788-5',
    name: 'Logistica del Norte',
    contact: 'Luis Alvarez',
    phone: '5678-8899',
    email: 'contacto@norte.com',
    city: 'Quetzaltenango',
    category: 'Transporte',
    status: 'activo',
    balance: 2650,
    overdueDays: 10,
    creditDays: 15,
    creditLimit: 18000,
    lastPurchase: '18/11/2024',
    lastDocument: 'COM-110'
  },
  {
    id: 'sup-004',
    nit: '154233-2',
    name: 'Agro Sur',
    contact: 'Carolina Mendez',
    phone: '4411-2333',
    email: 'carolina@agrosur.com',
    city: 'Escuintla',
    category: 'Alimentos',
    status: 'inactivo',
    balance: 0,
    overdueDays: 0,
    creditDays: 10,
    creditLimit: 12000,
    lastPurchase: '05/11/2024',
    lastDocument: 'COM-103'
  },
  {
    id: 'sup-005',
    nit: '778899-1',
    name: 'Tecnica Industrial',
    contact: 'Roberto Diaz',
    phone: '5566-9900',
    email: 'rdiaz@ti.com',
    city: 'Ciudad Capital',
    category: 'Tecnologia',
    status: 'moroso',
    balance: 8300,
    overdueDays: 32,
    creditDays: 25,
    creditLimit: 45000,
    lastPurchase: '17/11/2024',
    lastDocument: 'COM-109'
  },
  {
    id: 'sup-006',
    nit: '332211-9',
    name: 'Refacciones Centro',
    contact: 'Paola Reyes',
    phone: '5012-1122',
    email: 'soporte@refacciones.com',
    city: 'Chiquimula',
    category: 'Automotriz',
    status: 'activo',
    balance: 1500,
    overdueDays: 5,
    creditDays: 25,
    creditLimit: 25000,
    lastPurchase: '16/11/2024',
    lastDocument: 'COM-107'
  }
];

export const SUPPLIER_PURCHASES: SupplierPurchaseRow[] = [
  { date: '22/11/2024', document: 'COM-112', amount: 5250, status: 'pendiente' },
  { date: '20/11/2024', document: 'COM-111', amount: 7200, status: 'pagado' },
  { date: '18/11/2024', document: 'COM-110', amount: 8500, status: 'pagado' },
  { date: '14/11/2024', document: 'COM-109', amount: 4100, status: 'vencido' },
  { date: '11/11/2024', document: 'COM-108', amount: 2650, status: 'pendiente' }
];

export const SUPPLIER_REPORT: SupplierReportRow[] = [
  { supplier: 'Proveedor ABC', purchases: 56450, share: 45, lastPurchase: '22/11', state: 'Al dia' },
  { supplier: 'Distribuidora XYZ', purchases: 32100, share: 26, lastPurchase: '20/11', state: '15 dias' },
  { supplier: 'Logistica del Norte', purchases: 18980, share: 15, lastPurchase: '18/11', state: '7 dias' },
  { supplier: 'Tecnica Industrial', purchases: 12400, share: 10, lastPurchase: '17/11', state: 'Mora 5d' }
];

export const SUPPLIER_KPIS = [
  { label: 'Compras totales', value: 'Q125,450' },
  { label: 'Promedio mensual', value: 'Q10,454' },
  { label: 'Proveedor principal', value: 'ABC (45%)' }
];
