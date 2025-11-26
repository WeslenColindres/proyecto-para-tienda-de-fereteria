export type CustomerStatus = 'activo' | 'inactivo' | 'credito' | 'contado';
export type CustomerType = 'persona-natural' | 'persona-juridica' | 'extranjero';

export interface CustomerProps {
  id: string;
  nit: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  type: CustomerType;
  hasCredit: boolean;
  creditLimit: number;
  creditUsed: number;
  discount: number;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export class Customer {
  constructor(private props: CustomerProps) {}

  get id(): string {
    return this.props.id;
  }

  get isDeleted(): boolean {
    return !!this.props.deletedAt;
  }

  toJSON(): CustomerProps {
    return { ...this.props };
  }
}
