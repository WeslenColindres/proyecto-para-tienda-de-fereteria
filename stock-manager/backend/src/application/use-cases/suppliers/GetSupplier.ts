import { Supplier } from '../../../domain/entities/Supplier';
import { DomainError } from '../../../domain/errors/DomainError';
import type { StoreGateway } from '../../ports/StoreGateway';

export class GetSupplier {
  constructor(private readonly store: StoreGateway) {}

  async execute(id: string) {
    const data = await this.store.readStore();
    const supplier = data.suppliers.find((s) => s.id === id && !s.deletedAt);
    if (!supplier) {
      throw new DomainError('SUPPLIER_NOT_FOUND', 'Proveedor no encontrado', 404);
    }
    return new Supplier(supplier);
  }
}
