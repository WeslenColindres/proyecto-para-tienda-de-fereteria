import { Sale } from '../../domain/entities/Sale';
import type { ListSalesParams, SaleRepository } from '../../domain/repositories/SaleRepository';
import type { StoreGateway } from '../../application/ports/StoreGateway';
import { logger } from '../logger';

export class SaleStoreRepository implements SaleRepository {
  constructor(private readonly store: StoreGateway) {}

  private mapToDomain(raw: any): Sale {
    return new Sale({
      ...raw,
      items: raw.items ?? [],
      payments: raw.payments ?? [],
      totalDiscounts: raw.totalDiscounts ?? 0,
      requiresCertification: raw.requiresCertification ?? false,
      certificationAttempts: raw.certificationAttempts ?? 0,
    });
  }

  async list(params: ListSalesParams) {
    try {
      const page = Number(params.page) > 0 ? Number(params.page) : 1;
      const pageSize = Number(params.pageSize) > 0 ? Number(params.pageSize) : 20;
      const search = params.search?.trim().toLowerCase();

      const data = await this.store.readStore();
      const filtered = data.sales
        .filter((sale) => {
          if (params.docType && sale.docType !== params.docType) return false;
          if (params.status && sale.status !== params.status) return false;
          if (params.returnsOnly && sale.status !== 'anulada') return false;
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
        data: slice.map((item) => this.mapToDomain(item)),
        total,
        page,
        pageSize,
      };
    } catch (error) {
      logger.error('SaleStoreRepository.list fallo', { params, error });
      throw error;
    }
  }

  async findById(id: string): Promise<Sale | null> {
    try {
      const data = await this.store.readStore();
      const found = data.sales.find((s) => s.id === id);
      return found ? this.mapToDomain(found) : null;
    } catch (error) {
      logger.error('SaleStoreRepository.findById fallo', { id, error });
      throw error;
    }
  }

  async create(sale: Sale): Promise<void> {
    try {
      await this.store.withStoreLock((store) => {
        store.sales.push(sale.toJSON());
      });
    } catch (error) {
      logger.error('SaleStoreRepository.create fallo', { saleId: sale.id, error });
      throw error;
    }
  }
}
