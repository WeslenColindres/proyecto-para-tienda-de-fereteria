import type { SupplierProps } from '../../../domain/entities/Supplier';
import { Supplier } from '../../../domain/entities/Supplier';
import { DomainError } from '../../../domain/errors/DomainError';
import type { StoreGateway } from '../../ports/StoreGateway';
import { pushAuditLog } from '../../utils/audit';

export type UpdateSupplierInput = Partial<Omit<SupplierProps, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'deletedBy'>> & {
  id: string;
};

export class UpdateSupplier {
  constructor(private readonly store: StoreGateway) {}

  async execute(input: UpdateSupplierInput): Promise<Supplier> {
    if (!input.id) throw new DomainError('VALIDATION_ERROR', 'Id requerido', 400);

    const supplier = await this.store.withStoreLock((store) => {
      const current = store.suppliers.find((s) => s.id === input.id && !s.deletedAt);
      if (!current) {
        throw new DomainError('SUPPLIER_NOT_FOUND', 'Proveedor no encontrado', 404);
      }

      if (input.nit && input.nit !== current.nit) {
        const existsNit = store.suppliers.find((s) => s.id !== current.id && s.nit === input.nit && !s.deletedAt);
        if (existsNit) {
          throw new DomainError('SUPPLIER_DUPLICATE', 'Ya existe un proveedor con ese NIT', 409);
        }
      }

      if (input.email && input.email !== current.email) {
        const existsEmail = store.suppliers.find((s) => s.id !== current.id && s.email === input.email && !s.deletedAt);
        if (existsEmail) {
          throw new DomainError('SUPPLIER_DUPLICATE', 'Ya existe un proveedor con ese email', 409);
        }
      }

      const before = { ...current };
      Object.assign(current, input, { updatedAt: new Date().toISOString() });

      pushAuditLog(store, {
        action: 'update',
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
