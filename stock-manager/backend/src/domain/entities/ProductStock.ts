// Stock detallado por sucursal/almacén
export interface ProductStock {
  id?: string;
  productId: string;
  branchId?: string;
  warehouseId?: string; // compatibilidad con versiones anteriores
  available: number;
  stock?: number; // compatibilidad (usado previamente)
  reserved?: number;
  inTransit?: number;
  lastUpdated: string;
  lastMovementAt?: string; // compatibilidad con datos existentes
}
