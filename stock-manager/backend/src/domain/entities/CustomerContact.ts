export type CustomerContactType = 'PRINCIPAL' | 'SECUNDARIO' | 'EMERGENCIA';

export interface CustomerContactProps {
  id: string;
  customerId: string;
  name: string;
  position?: string;
  email?: string;
  phone?: string;
  type?: CustomerContactType;
  createdAt?: string;
  updatedAt?: string;
}
