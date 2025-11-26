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
  // Campos extendidos de auditoría
  movementTypeId?: string;
  sourceDocument?: string;
  sourceDocumentId?: string;
  unitCost?: number;
  totalCost?: number;
  previousStock?: number;
  newStock?: number;
  userId?: string;
  reason?: string;
  ipAddress?: string;
  additionalData?: Record<string, unknown>;
}

export class InventoryMovement {
  constructor(private props: InventoryMovementProps) {}

  toJSON(): InventoryMovementProps {
    return { ...this.props };
  }
}
