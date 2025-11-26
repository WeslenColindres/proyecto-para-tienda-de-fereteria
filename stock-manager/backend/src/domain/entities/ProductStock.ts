export interface ProductStockEntry {
  id: string;
  productId: string;
  warehouseId: string;
  stock: number;
  lastMovementAt?: string;
}
