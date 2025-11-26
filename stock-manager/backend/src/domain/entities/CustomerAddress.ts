export type CustomerAddressType = 'FISCAL' | 'ENTREGA' | 'FACTURACION';

export interface CustomerAddressProps {
  id: string;
  customerId: string;
  type: CustomerAddressType;
  address: string;
  department?: string;
  municipality?: string;
  zone?: string;
  reference?: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}
