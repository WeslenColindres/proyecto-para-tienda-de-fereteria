import type {
  InventoryDetailRow,
  InventoryKpi,
  InventoryMovement,
  InventoryWarehouseRow,
  ProductItem
} from '../types/products';

export const PRODUCT_CATALOG: ProductItem[] = [
  { id: 'p001', code: 'P001', name: 'Cafe Espresso', description: 'Cafe espresso en grano', category: 'Bebidas', categoryId: 'cat-bebidas', stock: 15, minStock: 5, price: 25, cost: 12.5, barcode: '12345001', tax: 12, unit: 'unidad', status: 'activo' },
  { id: 'p002', code: 'P002', name: 'Pan Frances', description: 'Pan fresco', category: 'Panaderia', categoryId: 'cat-pan', stock: 8, minStock: 5, price: 8, cost: 4.5, barcode: '12345002', tax: 12, unit: 'unidad', status: 'activo' },
  { id: 'p003', code: 'P003', name: 'Empanada de Pollo', description: 'Empanada artesanal', category: 'Panaderia', categoryId: 'cat-pan', stock: 25, minStock: 10, price: 12, cost: 6.5, barcode: '12345003', tax: 12, unit: 'unidad', status: 'activo' },
  { id: 'p004', code: 'P004', name: 'Te Earl Grey', description: 'Infusion de te', category: 'Bebidas', categoryId: 'cat-bebidas', stock: 30, minStock: 12, price: 15, cost: 7, barcode: '12345004', tax: 12, unit: 'unidad', status: 'activo' },
  { id: 'p005', code: 'P005', name: 'Jugos Naturales', description: 'Variedad de jugos', category: 'Bebidas', categoryId: 'cat-bebidas', stock: 12, minStock: 6, price: 18, cost: 9, barcode: '12345005', tax: 15, unit: 'litro', status: 'inactivo' },
  { id: 'p006', code: 'P006', name: 'Cacao Premium', description: 'Cacao gourmet', category: 'Bebidas', categoryId: 'cat-bebidas', stock: 3, minStock: 8, price: 20, cost: 11, barcode: '12345006', tax: 12, unit: 'unidad', status: 'descontinuado' }
];

export const PRODUCT_MOVEMENTS: InventoryMovement[] = [
  { id: 'm-001', product: 'P001 Cafe Espresso', type: 'Venta', qty: -5, balance: 15, datetime: '2025-11-22 10:30', document: 'A-050', user: 'Maria R.' },
  { id: 'm-002', product: 'P002 Pan Frances', type: 'Compra', qty: 20, balance: 8, datetime: '2025-11-22 10:25', document: 'COM-001', user: 'Carlos S.' },
  { id: 'm-003', product: 'P003 Empanada de Pollo', type: 'Venta', qty: -2, balance: 25, datetime: '2025-11-22 10:20', document: 'A-048', user: 'Andrea G.' },
  { id: 'm-004', product: 'P006 Cacao Premium', type: 'Merma', qty: -1, balance: 3, datetime: '2025-11-22 09:50', document: 'AJ-015', user: 'Luis V.' }
];

export const INVENTORY_OVERVIEW: InventoryKpi = {
  inventoryValue: 45230,
  productsWithStock: '124/150',
  lowStock: '12 (8%)',
  rotation: '4.2 dias'
};

export const INVENTORY_DETAIL: InventoryDetailRow[] = [
  { product: 'Cafe Espresso', stock: 15, value: 375, last: '2h', rotation: 'Alta', warehouse: 'Central' },
  { product: 'Pan Frances', stock: 8, value: 64, last: '5h', rotation: 'Media', warehouse: 'Central' },
  { product: 'Empanada Pollo', stock: 25, value: 300, last: '1h', rotation: 'Alta', warehouse: 'Central' }
];

export const INVENTORY_WAREHOUSES: InventoryWarehouseRow[] = [
  { warehouse: 'Central', products: 150, value: 45230, percentage: 100, capacity: 80 },
  { warehouse: 'Sucursal 1', products: 0, value: 0, percentage: 0, capacity: 0 }
];
