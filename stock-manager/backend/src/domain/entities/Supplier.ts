export interface SupplierProps {
  id: string;
  nit: string;
  name: string;
  commercialName?: string;
  email?: string;
  phone?: string;
  address?: string;
  creditDays?: number;
  status: 'activo' | 'inactivo';
  createdAt: Date;
  updatedAt: Date;
}

export class Supplier {
  constructor(public readonly props: SupplierProps) { }

  get id() { return this.props.id; }
  get nit() { return this.props.nit; }
  get name() { return this.props.name; }

  updateContactInfo(email?: string, phone?: string, address?: string) {
    if (email) this.props.email = email;
    if (phone) this.props.phone = phone;
    if (address) this.props.address = address;
    this.props.updatedAt = new Date();
  }

  toJSON() {
    return { ...this.props };
  }
}
