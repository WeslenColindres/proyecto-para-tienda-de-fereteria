export type ProductStatus = 'activo' | 'inactivo' | 'descontinuado';

export type ProductItem = {
  id: string;
  code: string;
  name: string;
  description?: string;
  category?: string;
  categoryId?: string;
  categoryName?: string;
  stock: number;
  minStock: number;
  price: number;
  cost: number;
  barcode: string;
  tax: number;
  unit: string;
  status: ProductStatus;
  active?: boolean;
  alertLevel?: 'critical' | 'warning' | 'info';
  updatedAt?: string;
};

export type InventoryMovement = {
  id: string;
  product?: string;
  type: 'Compra' | 'Venta' | 'Ajuste' | 'Merma' | 'entrada' | 'salida' | 'ajuste' | 'transferencia';
  qty: number;
  balance: number;
  datetime: string;
  document?: string;
  user?: string;
};

export type InventoryKpi = {
  inventoryValue: number;
  productsWithStock: string;
  lowStock: string;
  rotation: string;
};

export type InventoryDetailRow = {
  product: string;
  stock: number;
  value: number;
  last: string;
  rotation: string;
  warehouse: string;
};

export type InventoryWarehouseRow = {
  warehouse: string;
  products: number;
  value: number;
  percentage: number;
  capacity: number;
};

export type ProductTab = 'productos' | 'editar' | 'movimientos';

export type Category = {
  id: string;
  code: string;
  name: string;
  description?: string;
  color?: string;
  status: 'activo' | 'inactivo';
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AlertItem = {
  id: string;
  type: string;
  level: string;
  message: string;
  productId?: string;
  createdAt: string;
  isRead?: boolean;
};

export type ProductFilters = {
  search?: string;
  categoryId?: string;
  stockState?: 'all' | 'with-stock' | 'low' | 'no-stock' | 'preventive';
  status?: ProductStatus | 'all';
  page?: number;
  pageSize?: number;
};

export type ProductListChunk = { page: number; data: ProductItem[] };
export type ProductListResponse = {
  data: ProductItem[];
  total: number;
  page: number;
  pageSize: number;
  chunks: ProductListChunk[];
  counters: { critical: number; low: number; preventive: number };
};

export type ProductDetail = {
  product: ProductItem;
  stockByWarehouse: Array<{
    id?: string;
    warehouseId: string;
    warehouseName: string;
    stock: number;
    lastMovementAt?: string;
  }>;
  movements: InventoryMovement[];
  alerts: AlertItem[];
};

export type InventoryReport = {
  overview: InventoryKpi;
  detail: InventoryDetailRow[];
  warehouses: InventoryWarehouseRow[];
  alerts: AlertItem[];
};

export type ImportSummary = {
  totalRows: number;
  inserted: number;
  updated: number;
  errors: Array<{ row: number; message: string }>;
};
