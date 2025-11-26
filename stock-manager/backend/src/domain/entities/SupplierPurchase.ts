export type SupplierPurchaseStatus = 'pendiente' | 'pagado' | 'vencido';

export interface SupplierPurchaseProps {
  id: string;
  supplierId: string;
  date: string;
  documentNumber: string;
  amount: number;
  status: SupplierPurchaseStatus;
  createdAt: string;
  updatedAt: string;
}

export class SupplierPurchase {
  constructor(private props: SupplierPurchaseProps) {}

  get supplierId() {
    return this.props.supplierId;
  }

  toJSON(): SupplierPurchaseProps {
    return { ...this.props };
  }
}
