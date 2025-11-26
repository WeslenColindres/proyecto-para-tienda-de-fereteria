import type { Sale } from '../entities/Sale';
import type { SaleDocumentType, SaleStatus } from '../entities/Sale';

export interface ListSalesParams {
  page?: number;
  pageSize?: number;
  docType?: SaleDocumentType;
  status?: SaleStatus;
  search?: string;
  returnsOnly?: boolean;
}

export interface SaleRepository {
  list(params: ListSalesParams): Promise<{ data: Sale[]; total: number; page: number; pageSize: number }>;
  findById(id: string): Promise<Sale | null>;
  create(sale: Sale): Promise<void>;
}

