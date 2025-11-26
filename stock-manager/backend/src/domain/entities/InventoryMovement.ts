export type InventoryMovementType = 'entrada' | 'salida' | 'ajuste' | 'transferencia';

export interface InventoryMovementProps {
  id: string;
  productId: string;
  warehouseId: string;
  type: InventoryMovementType;
  qty: number;
  balance: number;
  document?: string;
  note?: string;
  datetime: string;
  createdBy?: string;
}

export class InventoryMovement {
  constructor(private props: InventoryMovementProps) {}

  toJSON(): InventoryMovementProps {
    return { ...this.props };
  }
}
