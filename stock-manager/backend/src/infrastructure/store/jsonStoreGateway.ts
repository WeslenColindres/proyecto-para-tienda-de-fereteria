import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { StoreGateway, StoreSchema } from '../../application/ports/StoreGateway';
import type { AlertProps } from '../../domain/entities/Alert';
import type { AuditLogProps } from '../../domain/entities/AuditLog';
import type { CategoryProps } from '../../domain/entities/Category';
import type { InventoryMovementProps } from '../../domain/entities/InventoryMovement';
import type { ProductProps } from '../../domain/entities/Product';
import type { ProductStockEntry } from '../../domain/entities/ProductStock';
import type { WarehouseProps } from '../../domain/entities/Warehouse';
import type { CustomerProps } from '../../domain/entities/Customer';
import type { SupplierProps } from '../../domain/entities/Supplier';
import type { SupplierPurchaseProps } from '../../domain/entities/SupplierPurchase';
import type { City, SupplierCategory } from '../../domain/entities/SupplierCatalog';

const DATA_FILE = path.join(process.cwd(), 'data', 'store.json');
const now = new Date().toISOString();

const defaultCategories: CategoryProps[] = [
  {
    id: 'cat-general',
    code: 'GEN',
    name: 'General',
    description: 'Categoria por defecto',
    status: 'activo',
    color: '#64748b',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'cat-bebidas',
    code: 'BEB',
    name: 'Bebidas',
    description: 'Bebidas y liquidos',
    status: 'activo',
    color: '#0ea5e9',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'cat-pan',
    code: 'PAN',
    name: 'Panaderia',
    description: 'Pan y reposteria',
    status: 'activo',
    color: '#f97316',
    createdAt: now,
    updatedAt: now,
  },
];

const defaultWarehouses: WarehouseProps[] = [
  { id: 'wh-main', code: 'WH-01', name: 'Almacen Central', capacity: 80, createdAt: now, updatedAt: now },
  { id: 'wh-branch', code: 'WH-02', name: 'Sucursal 1', capacity: 40, createdAt: now, updatedAt: now },
];

const defaultProducts: ProductProps[] = [
  {
    id: 'p001',
    code: 'P001',
    name: 'Cafe Espresso',
    description: 'Cafe espresso en grano',
    categoryId: 'cat-bebidas',
    barcode: '12345001',
    cost: 12.5,
    price: 25,
    tax: 12,
    unit: 'unidad',
    status: 'activo',
    stock: 15,
    minStock: 5,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p002',
    code: 'P002',
    name: 'Pan Frances',
    description: 'Pan fresco',
    categoryId: 'cat-pan',
    barcode: '12345002',
    cost: 4.5,
    price: 8,
    tax: 12,
    unit: 'unidad',
    status: 'activo',
    stock: 8,
    minStock: 5,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p003',
    code: 'P003',
    name: 'Empanada de Pollo',
    description: 'Empanada artesanal',
    categoryId: 'cat-pan',
    barcode: '12345003',
    cost: 6.5,
    price: 12,
    tax: 12,
    unit: 'unidad',
    status: 'activo',
    stock: 25,
    minStock: 10,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p004',
    code: 'P004',
    name: 'Te Earl Grey',
    description: 'Infusion de te',
    categoryId: 'cat-bebidas',
    barcode: '12345004',
    cost: 7,
    price: 15,
    tax: 12,
    unit: 'unidad',
    status: 'activo',
    stock: 30,
    minStock: 12,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p005',
    code: 'P005',
    name: 'Jugos Naturales',
    description: 'Variedad de jugos',
    categoryId: 'cat-bebidas',
    barcode: '12345005',
    cost: 9,
    price: 18,
    tax: 15,
    unit: 'litro',
    status: 'inactivo',
    stock: 12,
    minStock: 6,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'p006',
    code: 'P006',
    name: 'Cacao Premium',
    description: 'Cacao gourmet',
    categoryId: 'cat-bebidas',
    barcode: '12345006',
    cost: 11,
    price: 20,
    tax: 12,
    unit: 'unidad',
    status: 'descontinuado',
    stock: 3,
    minStock: 8,
    createdAt: now,
    updatedAt: now,
  },
];

const defaultProductStock: ProductStockEntry[] = defaultProducts.map((p) => ({
  id: `stk-${p.id}`,
  productId: p.id,
  warehouseId: 'wh-main',
  stock: p.stock,
  lastMovementAt: now,
}));

const defaultMovements: InventoryMovementProps[] = [
  {
    id: 'mv-001',
    productId: 'p001',
    warehouseId: 'wh-main',
    type: 'salida',
    qty: -5,
    balance: 15,
    document: 'A-050',
    datetime: now,
    createdBy: 'Maria R.',
  },
  {
    id: 'mv-002',
    productId: 'p002',
    warehouseId: 'wh-main',
    type: 'entrada',
    qty: 20,
    balance: 8,
    document: 'COM-001',
    datetime: now,
    createdBy: 'Carlos S.',
  },
  {
    id: 'mv-003',
    productId: 'p003',
    warehouseId: 'wh-main',
    type: 'salida',
    qty: -2,
    balance: 25,
    document: 'A-048',
    datetime: now,
    createdBy: 'Andrea G.',
  },
];

const defaultCities: City[] = [
  { id: 'city-capital', name: 'Ciudad Capital', country: 'GT' },
  { id: 'city-gt', name: 'Ciudad Gt', country: 'GT' },
  { id: 'city-quetz', name: 'Quetzaltenango', country: 'GT' },
  { id: 'city-esc', name: 'Escuintla', country: 'GT' },
  { id: 'city-chiquimula', name: 'Chiquimula', country: 'GT' },
];

const defaultSupplierCategories: SupplierCategory[] = [
  { id: 'sup-cat-alimentos', code: 'ALI', name: 'Alimentos', color: '#22c55e', status: 'activo', createdAt: now, updatedAt: now },
  { id: 'sup-cat-ferreteria', code: 'FER', name: 'Ferreteria', color: '#fb923c', status: 'activo', createdAt: now, updatedAt: now },
  { id: 'sup-cat-transporte', code: 'TRA', name: 'Transporte', color: '#0ea5e9', status: 'activo', createdAt: now, updatedAt: now },
  { id: 'sup-cat-tecnologia', code: 'TEC', name: 'Tecnologia', color: '#8b5cf6', status: 'activo', createdAt: now, updatedAt: now },
  { id: 'sup-cat-automotriz', code: 'AUT', name: 'Automotriz', color: '#f97316', status: 'activo', createdAt: now, updatedAt: now },
];

const defaultSuppliers: SupplierProps[] = [
  {
    id: 'sup-001',
    nit: '123456-7',
    name: 'Proveedor ABC',
    contactName: 'Juan Perez',
    phone: '5555-1234',
    email: 'compras@abc.com',
    cityId: 'city-capital',
    categoryId: 'sup-cat-alimentos',
    address: 'Calle Principal 123, Zona 12',
    creditDays: 30,
    creditLimit: 50000,
    status: 'moroso',
    balance: 12450,
    overdueDays: 42,
    lastPurchase: '2024-11-22',
    lastDocument: 'COM-112',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  },
  {
    id: 'sup-002',
    nit: '987654-3',
    name: 'Distribuidora XYZ',
    contactName: 'Maria Gomez',
    phone: '5555-7890',
    email: 'ventas@xyz.com',
    cityId: 'city-gt',
    categoryId: 'sup-cat-ferreteria',
    address: 'Zona 1, Ciudad Gt',
    creditDays: 20,
    creditLimit: 32000,
    status: 'activo',
    balance: 0,
    overdueDays: 0,
    lastPurchase: '2024-11-20',
    lastDocument: 'COM-111',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  },
  {
    id: 'sup-003',
    nit: '447788-5',
    name: 'Logistica del Norte',
    contactName: 'Luis Alvarez',
    phone: '5678-8899',
    email: 'contacto@norte.com',
    cityId: 'city-quetz',
    categoryId: 'sup-cat-transporte',
    address: 'Bodega Norte 12-34',
    creditDays: 15,
    creditLimit: 18000,
    status: 'activo',
    balance: 2650,
    overdueDays: 10,
    lastPurchase: '2024-11-18',
    lastDocument: 'COM-110',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  },
  {
    id: 'sup-004',
    nit: '154233-2',
    name: 'Agro Sur',
    contactName: 'Carolina Mendez',
    phone: '4411-2333',
    email: 'carolina@agrosur.com',
    cityId: 'city-esc',
    categoryId: 'sup-cat-alimentos',
    address: 'Km 25 Carretera al Sur',
    creditDays: 10,
    creditLimit: 12000,
    status: 'inactivo',
    balance: 0,
    overdueDays: 0,
    lastPurchase: '2024-11-05',
    lastDocument: 'COM-103',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  },
  {
    id: 'sup-005',
    nit: '778899-1',
    name: 'Tecnica Industrial',
    contactName: 'Roberto Diaz',
    phone: '5566-9900',
    email: 'rdiaz@ti.com',
    cityId: 'city-capital',
    categoryId: 'sup-cat-tecnologia',
    address: 'Zona 10, Torre 2',
    creditDays: 25,
    creditLimit: 45000,
    status: 'moroso',
    balance: 8300,
    overdueDays: 32,
    lastPurchase: '2024-11-17',
    lastDocument: 'COM-109',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  },
  {
    id: 'sup-006',
    nit: '332211-9',
    name: 'Refacciones Centro',
    contactName: 'Paola Reyes',
    phone: '5012-1122',
    email: 'soporte@refacciones.com',
    cityId: 'city-chiquimula',
    categoryId: 'sup-cat-automotriz',
    address: 'Zona 3, Chiquimula',
    creditDays: 25,
    creditLimit: 25000,
    status: 'activo',
    balance: 1500,
    overdueDays: 5,
    lastPurchase: '2024-11-16',
    lastDocument: 'COM-107',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  },
];

const defaultSupplierPurchases: SupplierPurchaseProps[] = [
  { id: 'sup-pur-001', supplierId: 'sup-001', date: '2024-11-22', documentNumber: 'COM-112', amount: 5250, status: 'pendiente', createdAt: now, updatedAt: now },
  { id: 'sup-pur-002', supplierId: 'sup-002', date: '2024-11-20', documentNumber: 'COM-111', amount: 7200, status: 'pagado', createdAt: now, updatedAt: now },
  { id: 'sup-pur-003', supplierId: 'sup-003', date: '2024-11-18', documentNumber: 'COM-110', amount: 8500, status: 'pagado', createdAt: now, updatedAt: now },
  { id: 'sup-pur-004', supplierId: 'sup-005', date: '2024-11-14', documentNumber: 'COM-109', amount: 4100, status: 'vencido', createdAt: now, updatedAt: now },
  { id: 'sup-pur-005', supplierId: 'sup-006', date: '2024-11-11', documentNumber: 'COM-108', amount: 2650, status: 'pendiente', createdAt: now, updatedAt: now },
];

const defaultCustomers: CustomerProps[] = [
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
    status: 'credito',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
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
    status: 'activo',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
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
    status: 'credito',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
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
    status: 'contado',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
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
    status: 'activo',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  },
];

const defaultAlerts: AlertProps[] = [
  {
    id: 'al-001',
    type: 'stock_critical',
    level: 'critical',
    message: 'Stock agotado o critico para Cacao Premium',
    productId: 'p006',
    isRead: false,
    createdAt: now,
  },
  {
    id: 'al-002',
    type: 'stock_low',
    level: 'warning',
    message: 'Stock bajo para Pan Frances',
    productId: 'p002',
    isRead: false,
    createdAt: now,
  },
];

const defaultAuditLogs: AuditLogProps[] = [
  {
    id: 'au-001',
    userId: 'system',
    action: 'seed',
    entityType: 'bootstrap',
    entityId: 'seed',
    createdAt: now,
  },
];

async function ensureStoreFile(): Promise<void> {
  try {
    await fs.access(DATA_FILE);
  } catch {
    const initial: StoreSchema = {
      products: defaultProducts,
      categories: defaultCategories,
      warehouses: defaultWarehouses,
      productStock: defaultProductStock,
    inventoryMovements: defaultMovements,
    alerts: defaultAlerts,
    auditLogs: defaultAuditLogs,
    sales: [],
    suppliers: defaultSuppliers,
    supplierPurchases: defaultSupplierPurchases,
    supplierCategories: defaultSupplierCategories,
    cities: defaultCities,
    customers: defaultCustomers,
  };
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(initial, null, 2), 'utf8');
  }
}

function ensureProductDefaults(product: any, defaultCategoryId?: string): ProductProps {
  const base: ProductProps = {
    id: product.id ?? randomUUID(),
    code: product.code ?? `P-${Math.random().toString(36).slice(2, 6)}`,
    name: product.name ?? 'Producto sin nombre',
    description: product.description ?? '',
    categoryId: product.categoryId ?? product.category ?? defaultCategoryId,
    barcode: product.barcode ?? product.code ?? '',
    cost: typeof product.cost === 'number' ? product.cost : Math.max(Number(product.price ?? 0) * 0.6, 0),
    price: typeof product.price === 'number' ? product.price : 0,
    tax: typeof product.tax === 'number' ? product.tax : 12,
    unit: product.unit ?? 'unidad',
    status: product.status ?? (product.active === false ? 'descontinuado' : 'activo'),
    stock: typeof product.stock === 'number' ? product.stock : 0,
    minStock: typeof product.minStock === 'number' ? product.minStock : 0,
    createdAt: product.createdAt ?? now,
    updatedAt: product.updatedAt ?? now,
    deletedAt: product.deletedAt ?? null,
    createdBy: product.createdBy,
    updatedBy: product.updatedBy,
    active: product.active,
  };

  return { ...base, active: base.status !== 'descontinuado' && !base.deletedAt };
}

function ensureSupplierDefaults(supplier: Partial<SupplierProps>, catalogs: { cities: City[]; categories: SupplierCategory[] }): SupplierProps {
  const cityId = supplier.cityId ?? catalogs.cities[0]?.id ?? 'city-undefined';
  const categoryId = supplier.categoryId ?? catalogs.categories[0]?.id ?? 'sup-cat-undefined';
  const createdAt = supplier.createdAt ?? now;

  return {
    id: supplier.id ?? randomUUID(),
    nit: supplier.nit ?? 'SIN-NIT',
    name: supplier.name ?? 'Proveedor sin nombre',
    contactName: supplier.contactName ?? (supplier as any).contact ?? 'Sin contacto',
    phone: supplier.phone ?? '',
    email: supplier.email ?? '',
    cityId,
    categoryId,
    address: supplier.address ?? '',
    creditDays: typeof supplier.creditDays === 'number' ? supplier.creditDays : 0,
    creditLimit: typeof supplier.creditLimit === 'number' ? supplier.creditLimit : 0,
    status: supplier.status ?? 'activo',
    balance: typeof supplier.balance === 'number' ? supplier.balance : 0,
    overdueDays: typeof supplier.overdueDays === 'number' ? supplier.overdueDays : 0,
    lastPurchase: supplier.lastPurchase ?? undefined,
    lastDocument: supplier.lastDocument ?? undefined,
    createdAt,
    updatedAt: supplier.updatedAt ?? createdAt,
    deletedAt: supplier.deletedAt ?? null,
    deletedBy: supplier.deletedBy ?? null,
  };
}

function normalizeStore(parsed: Partial<StoreSchema>): StoreSchema {
  const categories = parsed.categories?.length ? parsed.categories : defaultCategories;
  const warehouses = parsed.warehouses?.length ? parsed.warehouses : defaultWarehouses;
  const productStock = parsed.productStock ?? defaultProductStock;
  const cities = parsed.cities?.length ? parsed.cities : defaultCities;
  const supplierCategories = parsed.supplierCategories?.length ? parsed.supplierCategories : defaultSupplierCategories;
  const customers = parsed.customers ?? defaultCustomers;

  const products = (parsed.products ?? defaultProducts).map((product) => {
    const normalized = ensureProductDefaults(product, categories[0]?.id);
    const stockSum = productStock
      .filter((ps) => ps.productId === normalized.id)
      .reduce((acc, item) => acc + (item.stock ?? 0), 0);
    if (stockSum > 0) normalized.stock = stockSum;
    return normalized;
  });

  const buildAlertsFromStock = (): AlertProps[] => {
    const alerts: AlertProps[] = [];
    products.forEach((product) => {
      if (product.deletedAt) return;
      if (product.stock === 0 || product.stock < product.minStock * 0.5) {
        alerts.push({
          id: `auto-al-${product.id}`,
          type: 'stock_critical',
          level: 'critical',
          message: `Stock critico para ${product.name}`,
          productId: product.id,
          isRead: false,
          createdAt: now,
        });
      } else if (product.stock < product.minStock) {
        alerts.push({
          id: `auto-al-${product.id}`,
          type: 'stock_low',
          level: 'warning',
          message: `Stock bajo para ${product.name}`,
          productId: product.id,
          isRead: false,
          createdAt: now,
        });
      } else if (product.stock < product.minStock * 1.5) {
        alerts.push({
          id: `auto-al-${product.id}`,
          type: 'stock_preventive',
          level: 'info',
          message: `Stock preventivo para ${product.name}`,
          productId: product.id,
          isRead: false,
          createdAt: now,
        });
      }
    });
    return alerts;
  };

  const supplierPurchases = (parsed.supplierPurchases ?? defaultSupplierPurchases).map((purchase) => ({
    id: purchase.id ?? randomUUID(),
    supplierId: purchase.supplierId ?? defaultSuppliers[0]?.id ?? 'sup-unknown',
    date: purchase.date ?? now,
    documentNumber: purchase.documentNumber ?? 'N/D',
    amount: typeof purchase.amount === 'number' ? purchase.amount : 0,
    status: purchase.status ?? 'pendiente',
    createdAt: purchase.createdAt ?? now,
    updatedAt: purchase.updatedAt ?? purchase.createdAt ?? now,
  }));
  const suppliers = (parsed.suppliers ?? defaultSuppliers).map((supplier) =>
    ensureSupplierDefaults(supplier, { cities, categories: supplierCategories }),
  );

  suppliers.forEach((supplier) => {
    if (!supplier.lastPurchase) {
      const last = supplierPurchases
        .filter((p) => p.supplierId === supplier.id)
        .sort((a, b) => (a.date > b.date ? -1 : 1))[0];
      if (last) {
        supplier.lastPurchase = last.date;
        supplier.lastDocument = last.documentNumber;
      }
    }
  });

  return {
    products,
    categories,
    warehouses,
    productStock,
    inventoryMovements: parsed.inventoryMovements ?? defaultMovements,
    alerts: parsed.alerts ?? buildAlertsFromStock(),
    auditLogs: parsed.auditLogs ?? defaultAuditLogs,
    sales: parsed.sales ?? [],
    suppliers,
    supplierPurchases,
    supplierCategories,
    cities,
    customers: customers.map((c) => ({
      ...c,
      createdAt: c.createdAt ?? now,
      updatedAt: c.updatedAt ?? c.createdAt ?? now,
      deletedAt: c.deletedAt ?? null,
    })),
  };
}

async function readStoreFile(): Promise<StoreSchema> {
  await ensureStoreFile();
  const raw = await fs.readFile(DATA_FILE, 'utf8');
  const parsed = JSON.parse(raw) as Partial<StoreSchema>;
  return normalizeStore(parsed);
}

async function writeStoreFile(store: StoreSchema): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), 'utf8');
}

let queue: Promise<unknown> = Promise.resolve();

export class JsonStoreGateway implements StoreGateway {
  async readStore(): Promise<StoreSchema> {
    return readStoreFile();
  }

  async withStoreLock<T>(fn: (store: StoreSchema) => T | Promise<T>): Promise<T> {
    let result: T | undefined;

    queue = queue.then(async () => {
      const store = await readStoreFile();
      result = await fn(store);
      await writeStoreFile(store);
    });

    await queue;
    if (result === undefined) {
      throw new Error('withStoreLock did not return a result');
    }
    return result;
  }
}
