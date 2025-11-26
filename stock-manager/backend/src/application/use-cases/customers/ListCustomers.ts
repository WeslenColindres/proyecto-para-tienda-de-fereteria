import { Customer } from '../../../domain/entities/Customer';
import type { CustomerStatus, CustomerType } from '../../../domain/entities/Customer';
import type { StoreGateway } from '../../ports/StoreGateway';

export interface ListCustomersFilters {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: CustomerStatus | 'all';
  city?: string | 'all';
  type?: CustomerType | 'all';
  credit?: 'con' | 'sin' | 'all';
}

export class ListCustomers {
  constructor(private readonly store: StoreGateway) {}

  async execute(filters: ListCustomersFilters) {
    const page = Number(filters.page) > 0 ? Number(filters.page) : 1;
    const pageSize = Number(filters.pageSize) > 0 ? Number(filters.pageSize) : 20;
    const search = (filters.q ?? '').trim().toLowerCase();

    const data = await this.store.readStore();

    const filtered = data.customers
      .filter((customer) => !customer.deletedAt)
      .filter((customer) => {
        if (filters.status && filters.status !== 'all' && customer.status !== filters.status) return false;
        if (filters.city && filters.city !== 'all' && customer.city !== filters.city) return false;
        if (filters.type && filters.type !== 'all' && customer.type !== filters.type) return false;
        if (filters.credit && filters.credit !== 'all') {
          if (filters.credit === 'con' && !customer.hasCredit) return false;
          if (filters.credit === 'sin' && customer.hasCredit) return false;
        }
        if (search) {
          const haystack = `${customer.nit} ${customer.name} ${customer.phone} ${customer.email}`.toLowerCase();
          if (!haystack.includes(search)) return false;
        }
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const slice = filtered.slice(start, start + pageSize);

    return {
      data: slice.map((item) => new Customer(item)),
      total,
      page,
      pageSize,
    };
  }
}
