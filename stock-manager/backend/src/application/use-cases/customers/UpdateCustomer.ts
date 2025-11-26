import { Customer } from '../../../domain/entities/Customer';
import type { CustomerProps } from '../../../domain/entities/Customer';
import { DomainError } from '../../../domain/errors/DomainError';
import type { StoreGateway } from '../../ports/StoreGateway';
import { pushAuditLog } from '../../utils/audit';

export type UpdateCustomerInput = Partial<Omit<CustomerProps, 'createdAt' | 'updatedAt' | 'deletedAt'>> & { id: string };

export class UpdateCustomer {
  constructor(private readonly store: StoreGateway) {}

  async execute(input: UpdateCustomerInput): Promise<Customer> {
    if (!input.id) throw new DomainError('VALIDATION_ERROR', 'Id requerido', 400);

    const customer = await this.store.withStoreLock((store) => {
      const current = store.customers.find((c) => c.id === input.id && !c.deletedAt);
      if (!current) throw new DomainError('CUSTOMER_NOT_FOUND', 'Cliente no encontrado', 404);

      if (input.nit && input.nit !== current.nit) {
        const existsNit = store.customers.find((c) => c.nit === input.nit && c.id !== current.id && !c.deletedAt);
        if (existsNit) throw new DomainError('CUSTOMER_DUPLICATE', 'NIT ya registrado', 409);
      }

      const before = { ...current };
      Object.assign(current, input, { updatedAt: new Date().toISOString() });

      pushAuditLog(store, { action: 'update', entityType: 'customer', entityId: current.id, before, after: current });
      return new Customer(current);
    });

    return customer;
  }
}
