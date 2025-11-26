import { Customer } from '../../../domain/entities/Customer';
import { DomainError } from '../../../domain/errors/DomainError';
import type { StoreGateway } from '../../ports/StoreGateway';
import { pushAuditLog } from '../../utils/audit';

export class DeleteCustomer {
  constructor(private readonly store: StoreGateway) {}

  async execute(id: string): Promise<Customer> {
    if (!id) throw new DomainError('VALIDATION_ERROR', 'Id requerido', 400);

    const customer = await this.store.withStoreLock((store) => {
      const current = store.customers.find((c) => c.id === id && !c.deletedAt);
      if (!current) throw new DomainError('CUSTOMER_NOT_FOUND', 'Cliente no encontrado', 404);

      const before = { ...current };
      current.deletedAt = new Date().toISOString();
      current.status = 'inactivo';

      pushAuditLog(store, { action: 'soft_delete', entityType: 'customer', entityId: current.id, before, after: current });
      return new Customer(current);
    });

    return customer;
  }
}
