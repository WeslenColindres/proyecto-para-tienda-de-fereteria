import { DomainError } from '../../../domain/errors/DomainError';
import type { StoreGateway } from '../../ports/StoreGateway';

export interface ListProductMovementsInput {
  productId: string;
  page?: number;
  limit?: number;
}

export class ListProductMovements {
  constructor(private readonly store: StoreGateway) {}

  async execute(input: ListProductMovementsInput) {
    if (!input.productId) throw new DomainError('VALIDATION_ERROR', 'productId requerido', 400);

    const data = await this.store.readStore();
    const product = data.products.find((p) => p.id === input.productId);
    if (!product) throw new DomainError('PRODUCT_NOT_FOUND', 'Producto no encontrado', 404);

    const page = Number(input.page) > 0 ? Number(input.page) : 1;
    const limit = Number(input.limit) > 0 ? Number(input.limit) : 10;

    const filtered = data.inventoryMovements
      .filter((m) => m.productId === input.productId)
      .sort((a, b) => (a.datetime > b.datetime ? -1 : 1));

    const start = (page - 1) * limit;
    const slice = filtered.slice(start, start + limit);

    return {
      data: slice,
      total: filtered.length,
      page,
      limit,
      product: { id: product.id, name: product.name, code: product.code },
    };
  }
}
