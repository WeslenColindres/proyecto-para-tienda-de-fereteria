export type ProductStatus = 'activo' | 'inactivo' | 'descontinuado';

export type ProductItem = {
  id: string;
  code: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
  cost: number;
  barcode: string;
  tax: number;
  unit: string;
  status: ProductStatus;
};

export type InventoryMovement = {
  id: string;
  product: string;
  type: 'Compra' | 'Venta' | 'Ajuste' | 'Merma';
  qty: number;
  balance: number;
  datetime: string;
  document: string;
  user: string;
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
