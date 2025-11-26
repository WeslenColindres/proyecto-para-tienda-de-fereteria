export interface SupplierCategory {
  id: string;
  code: string;
  name: string;
  color?: string;
  status?: 'activo' | 'inactivo';
  createdAt?: string;
  updatedAt?: string;
}

export interface City {
  id: string;
  name: string;
  country?: string;
}
