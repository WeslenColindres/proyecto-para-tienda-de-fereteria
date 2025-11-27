export type ProductStatus = 'activo' | 'inactivo' | 'descontinuado';

export type ProductItem = {
  id: string;
  code: string;
  sku?: string; // alias/codigo alterno
  name: string;
  description?: string;
  category?: string;
  categoryId?: string;
  categoryName?: string;
  // Relaciones
  supplierId?: string; // id_proveedor_principal
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
  // Flags de inventario/venta
  isInventoriable?: boolean; // es_inventariable
  isSellable?: boolean; // es_vendible
  isPurchasable?: boolean; // es_comprable
  // Inventario avanzado
  reorderPoint?: number; // punto_reorden
  maxStock?: number; // stock_maximo
  physicalLocation?: string; // ubicacion_fisica
  // Metadatos
  readonly createdAt?: string; // fecha_creacion
  readonly updatedAt?: string; // fecha_modificacion
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
  // Auditoría extendida
  movementTypeId?: string;
  sourceDocument?: string;
  sourceDocumentId?: string;
  unitCost?: number;
  totalCost?: number;
  readonly previousStock?: number;
  readonly newStock?: number;
  readonly userId?: string;
  reason?: string;
  readonly ipAddress?: string;
  additionalData?: Record<string, any>;
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
  id: string; // mapped from number
  name: string;
  description?: string;
  parentId?: number | null;
  active: boolean;
  createdAt?: string;
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
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
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

// Stock detallado por sucursal
export type ProductStock = {
  productId: string;
  branchId: string;
  available: number;
  readonly reserved: number; // cantidad_reservada
  readonly inTransit: number; // cantidad_transito
  readonly lastUpdated: string;
};
