export type SupplierStatus = 'activo' | 'inactivo' | 'moroso';

export interface SupplierProps {
  id: string;
  nit: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  cityId: string;
  categoryId: string;
  address?: string;
  creditDays: number;
  creditLimit: number;
  status: SupplierStatus;
  balance: number;
  overdueDays: number;
  lastPurchase?: string;
  lastDocument?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  deletedBy?: string | null;
}

export class Supplier {
  constructor(private props: SupplierProps) {}

  get id(): string {
    return this.props.id;
  }

  get status(): SupplierStatus {
    return this.props.status;
  }

  get balance(): number {
    return this.props.balance;
  }

  update(data: Partial<SupplierProps>) {
    this.props = { ...this.props, ...data, updatedAt: data.updatedAt ?? new Date().toISOString() };
  }

  markDeleted(deletedBy?: string) {
    this.props.deletedAt = new Date().toISOString();
    this.props.deletedBy = deletedBy ?? 'system';
    this.props.status = 'inactivo';
  }

  toJSON(): SupplierProps {
    return { ...this.props };
  }
}
