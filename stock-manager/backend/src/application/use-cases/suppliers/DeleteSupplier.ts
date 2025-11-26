import { Supplier } from '../../../domain/entities/Supplier';
import { DomainError } from '../../../domain/errors/DomainError';
import type { StoreGateway } from '../../ports/StoreGateway';
import { pushAuditLog } from '../../utils/audit';

export class DeleteSupplier {
  constructor(private readonly store: StoreGateway) {}

  async execute(id: string, deletedBy?: string): Promise<Supplier> {
    if (!id) throw new DomainError('VALIDATION_ERROR', 'Id requerido', 400);

    const supplier = await this.store.withStoreLock((store) => {
      const current = store.suppliers.find((s) => s.id === id && !s.deletedAt);
      if (!current) {
        throw new DomainError('SUPPLIER_NOT_FOUND', 'Proveedor no encontrado', 404);
      }

      const before = { ...current };
      current.deletedAt = new Date().toISOString();
      current.deletedBy = deletedBy ?? 'system';
      current.status = 'inactivo';

      pushAuditLog(store, {
        action: 'soft_delete',
        entityType: 'supplier',
        entityId: current.id,
        before,
        after: current,
      });

      return new Supplier(current);
    });

    return supplier;
  }
}
