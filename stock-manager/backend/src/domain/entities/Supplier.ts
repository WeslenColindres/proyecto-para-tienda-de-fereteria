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
  status: 'activo' | 'inactivo' | 'moroso';
  balance?: number;
  overdueDays?: number;
  rating?: number;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class Supplier {
  constructor(public readonly props: SupplierProps) { }

  get id() { return this.props.id; }
  get nit() { return this.props.nit; }
  get name() { return this.props.name; }

  updateContactInfo(email?: string, phone?: string, address?: string, contactName?: string) {
    if (email) this.props.email = email;
    if (phone) this.props.phone = phone;
    if (address) this.props.address = address;
    if (contactName) this.props.contactName = contactName;
    this.props.updatedAt = new Date();
  }

  softDelete() {
    this.props.deletedAt = new Date();
    this.props.updatedAt = new Date();
  }

  restore() {
    this.props.deletedAt = undefined;
    this.props.updatedAt = new Date();
  }

  toJSON() {
    return { ...this.props };
  }
}
