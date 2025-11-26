import { Product } from '../../../domain/entities/Product';
import type { StoreGateway } from '../../ports/StoreGateway';

export type StockStateFilter = 'all' | 'with-stock' | 'low' | 'no-stock' | 'preventive';

export interface ListProductsFilters {
  includeInactive?: boolean;
  search?: string;
  categoryId?: string;
  status?: 'activo' | 'inactivo' | 'descontinuado' | 'all';
  stockState?: StockStateFilter;
  page?: number;
  pageSize?: number;
  preloadChunks?: number;
}

export interface ProductChunk {
  page: number;
  data: Product[];
}

export interface ListProductsResult {
  data: Product[];
  total: number;
  page: number;
  pageSize: number;
  chunks: ProductChunk[];
  counters: { critical: number; low: number; preventive: number };
}

export class ListProducts {
  constructor(private readonly store: StoreGateway) {}

  async execute(filters: ListProductsFilters = {}): Promise<ListProductsResult> {
    const page = Number(filters.page) > 0 ? Number(filters.page) : 1;
    const pageSize = Number(filters.pageSize) > 0 ? Number(filters.pageSize) : 15;
    const preloadChunks = Math.max(1, filters.preloadChunks ?? 3);
    const search = filters.search?.trim().toLowerCase();

    const data = await this.store.readStore();
    const filtered = data.products
      .filter((product) =>
        filters.includeInactive ? !product.deletedAt : product.status !== 'descontinuado' && !product.deletedAt,
      )
      .filter((product) => (filters.categoryId ? product.categoryId === filters.categoryId : true))
      .filter((product) => (filters.status && filters.status !== 'all' ? product.status === filters.status : true))
      .filter((product) => {
        if (!filters.stockState || filters.stockState === 'all') return true;
        if (filters.stockState === 'with-stock') return product.stock > 0;
        if (filters.stockState === 'no-stock') return product.stock === 0;
        if (filters.stockState === 'low') return product.stock < product.minStock;
        if (filters.stockState === 'preventive') return product.stock < product.minStock * 1.5;
        return true;
      })
      .filter((product) => {
        if (!search) return true;
        const haystack = `${product.code} ${product.name} ${product.barcode ?? ''}`.toLowerCase();
        return haystack.includes(search);
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    const critical = filtered.filter((p) => p.stock === 0 || p.stock < p.minStock * 0.5).length;
    const low = filtered.filter((p) => p.stock > 0 && p.stock < p.minStock).length;
    const preventive = filtered.filter((p) => p.stock >= p.minStock && p.stock < p.minStock * 1.5).length;

    const total = filtered.length;
    const chunks: ProductChunk[] = [];
    for (let i = 0; i < preloadChunks; i += 1) {
      const targetPage = page + i;
      const start = (targetPage - 1) * pageSize;
      const slice = filtered.slice(start, start + pageSize);
      if (!slice.length) break;
      chunks.push({ page: targetPage, data: slice.map((item) => new Product(item)) });
    }

    return {
      data: chunks.find((chunk) => chunk.page === page)?.data ?? [],
      total,
      page,
      pageSize,
      chunks,
      counters: { critical, low, preventive },
    };
  }
}
