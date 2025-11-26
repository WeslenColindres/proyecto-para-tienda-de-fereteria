import { DomainError } from '../../../domain/errors/DomainError';
import type { StoreGateway } from '../../ports/StoreGateway';

export class GetSale {
  constructor(private readonly store: StoreGateway) {}

  async execute(id: string) {
    if (!id) {
      throw new DomainError('VALIDATION_ERROR', 'Id de venta requerido', 400);
    }

    const data = await this.store.readStore();
    const sale = data.sales.find((s) => s.id === id);
    if (!sale) {
      throw new DomainError('NOT_FOUND', 'Venta no encontrada', 404);
    }
    return sale;
  }
}

