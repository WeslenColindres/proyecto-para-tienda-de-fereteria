import { randomUUID } from 'node:crypto';
import { Customer } from '../../../domain/entities/Customer';
import type { CustomerProps } from '../../../domain/entities/Customer';
import { DomainError } from '../../../domain/errors/DomainError';
import type { StoreGateway } from '../../ports/StoreGateway';
import { pushAuditLog } from '../../utils/audit';

export type NewCustomerInput = Omit<CustomerProps, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;

export class CreateCustomer {
  constructor(private readonly store: StoreGateway) {}

  async execute(input: NewCustomerInput): Promise<Customer> {
    this.validate(input);

    const customer = await this.store.withStoreLock((store) => {
      const existsNit = store.customers.find((c) => c.nit === input.nit && !c.deletedAt);
      if (existsNit) throw new DomainError('CUSTOMER_DUPLICATE', 'NIT ya registrado', 409);

      const nowIso = new Date().toISOString();
      const props: CustomerProps = {
        id: randomUUID(),
        nit: input.nit.trim(),
        name: input.name.trim(),
        phone: input.phone ?? '',
        email: input.email ?? '',
        city: input.city ?? '',
        type: input.type,
        hasCredit: input.hasCredit,
        creditLimit: input.creditLimit ?? 0,
        creditUsed: input.creditUsed ?? 0,
        discount: input.discount ?? 0,
        status: input.status ?? 'activo',
        createdAt: nowIso,
        updatedAt: nowIso,
        deletedAt: null,
      };

      store.customers.push(props);
      pushAuditLog(store, { action: 'create', entityType: 'customer', entityId: props.id, before: null, after: props });
      return new Customer(props);
    });

    return customer;
  }

  private validate(input: NewCustomerInput) {
    if (!input.nit?.trim()) throw new DomainError('VALIDATION_ERROR', 'NIT requerido', 400);
    if (!input.name?.trim()) throw new DomainError('VALIDATION_ERROR', 'Nombre requerido', 400);
    if (!input.type) throw new DomainError('VALIDATION_ERROR', 'Tipo requerido', 400);
  }
}
