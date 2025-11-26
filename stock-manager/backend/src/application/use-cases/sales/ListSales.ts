import { Sale } from '../../../domain/entities/Sale';
import type { SaleDocumentType, SaleStatus } from '../../../domain/entities/Sale';
import type { StoreGateway } from '../../ports/StoreGateway';

export interface ListSalesFilters {
  page?: number;
  pageSize?: number;
  docType?: SaleDocumentType;
  status?: SaleStatus;
  search?: string;
  returnsOnly?: boolean;
  from?: string;
  to?: string;
}

export class ListSales {
  constructor(private readonly store: StoreGateway) {}

  async execute(filters: ListSalesFilters) {
    const page = Number(filters.page) > 0 ? Number(filters.page) : 1;
    const pageSize = Number(filters.pageSize) > 0 ? Number(filters.pageSize) : 20;
    const search = filters.search?.trim().toLowerCase();

    const data = await this.store.readStore();
    const fromDate = filters.from ? new Date(filters.from) : null;
    const toDate = filters.to ? new Date(filters.to) : null;

    const filtered = data.sales
      .filter((sale) => {
        if (filters.docType && sale.docType !== filters.docType) return false;
        if (filters.status && sale.status !== filters.status) return false;
        if (filters.returnsOnly && sale.status !== 'anulada') return false;
        if (fromDate && new Date(sale.datetime) < fromDate) return false;
        if (toDate && new Date(sale.datetime) > toDate) return false;
        if (search) {
          const haystack = `${sale.docNumber} ${sale.clientName} ${sale.clientNit} ${sale.user}`.toLowerCase();
          if (!haystack.includes(search)) return false;
        }
        return true;
      })
      .sort((a, b) => (a.datetime > b.datetime ? -1 : 1));

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const slice = filtered.slice(start, start + pageSize);

    return {
      data: slice.map((item) => new Sale(item)),
      total,
      page,
      pageSize,
    };
  }
}
