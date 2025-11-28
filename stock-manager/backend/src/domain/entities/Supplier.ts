export type SupplierStatus = 'activo' | 'inactivo' | 'bloqueado' | 'moroso' | 'eliminado';

export interface SupplierProps {
  id: string;
  nit: string;
  name: string;
  commercialName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  cityId?: string;
  cityName?: string; // For display
  categoryId?: string;
  categoryName?: string; // For display
  creditDays?: number;
  creditLimit?: number;
  status: SupplierStatus;
  balance?: number; // currentBalance
  overdueDays?: number;
  rating?: number;
  paymentConditions?: string;
  version: number;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class Supplier {
  constructor(public readonly props: SupplierProps) { }

  get id() { return this.props.id; }
  get nit() { return this.props.nit; }
  get name() { return this.props.name; }
  get status() { return this.props.status; }
  get version() { return this.props.version; }

  updateContactInfo(email?: string, phone?: string, address?: string, contactName?: string) {
    if (email) this.props.email = email;
    if (phone) this.props.phone = phone;
    if (address) this.props.address = address;
    if (contactName) this.props.contactName = contactName;
    this.props.updatedAt = new Date();
  }

  updateFinancialInfo(creditDays?: number, creditLimit?: number, paymentConditions?: string) {
    if (creditDays !== undefined) this.props.creditDays = creditDays;
    if (creditLimit !== undefined) this.props.creditLimit = creditLimit;
    if (paymentConditions !== undefined) this.props.paymentConditions = paymentConditions;
    this.props.updatedAt = new Date();
  }

  changeStatus(status: SupplierStatus) {
    this.props.status = status;
    this.props.updatedAt = new Date();
  }

  softDelete() {
    this.props.status = 'eliminado';
    this.props.deletedAt = new Date();
    this.props.updatedAt = new Date();
  }

  restore() {
    this.props.status = 'activo';
    this.props.deletedAt = undefined;
    this.props.updatedAt = new Date();
  }

  toJSON() {
    return { ...this.props };
  }
}
