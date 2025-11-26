import { Supplier } from '../../../domain/entities/Supplier';
import type { SupplierStatus } from '../../../domain/entities/Supplier';
import type { StoreGateway } from '../../ports/StoreGateway';

export interface ListSuppliersFilters {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: SupplierStatus | 'all';
  cityId?: string | 'all';
  categoryId?: string | 'all';
}

export class ListSuppliers {
  constructor(private readonly store: StoreGateway) {}

  async execute(filters: ListSuppliersFilters) {
    const page = Number(filters.page) > 0 ? Number(filters.page) : 1;
    const pageSize = Number(filters.pageSize) > 0 ? Number(filters.pageSize) : 20;
    const search = (filters.q ?? '').trim().toLowerCase();

    const data = await this.store.readStore();

    const filtered = data.suppliers
      .filter((supplier) => !supplier.deletedAt)
      .filter((supplier) => {
        if (filters.status && filters.status !== 'all' && supplier.status !== filters.status) return false;
        if (filters.cityId && filters.cityId !== 'all' && supplier.cityId !== filters.cityId) return false;
        if (filters.categoryId && filters.categoryId !== 'all' && supplier.categoryId !== filters.categoryId) return false;
        if (search) {
          const haystack = `${supplier.nit} ${supplier.name} ${supplier.contactName} ${supplier.email} ${supplier.phone}`.toLowerCase();
          if (!haystack.includes(search)) return false;
        }
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const slice = filtered.slice(start, start + pageSize);

    const counters = filtered.reduce(
      (acc, supplier) => {
        acc[supplier.status] += 1;
        return acc;
      },
      { activo: 0, inactivo: 0, moroso: 0 } as Record<SupplierStatus, number>,
    );

    return {
      data: slice.map((item) => new Supplier(item)),
      total,
      page,
      pageSize,
      counters,
      filters: {
        search,
        status: filters.status ?? 'all',
        cityId: filters.cityId ?? 'all',
        categoryId: filters.categoryId ?? 'all',
      },
    };
  }
}
