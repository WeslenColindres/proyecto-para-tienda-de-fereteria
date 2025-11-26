import { Customer } from '../../../domain/entities/Customer';
import { DomainError } from '../../../domain/errors/DomainError';
import type { StoreGateway } from '../../ports/StoreGateway';

export class GetCustomer {
  constructor(private readonly store: StoreGateway) {}

  async execute(id: string) {
    const data = await this.store.readStore();
    const customer = data.customers.find((c) => c.id === id && !c.deletedAt);
    if (!customer) {
      throw new DomainError('CUSTOMER_NOT_FOUND', 'Cliente no encontrado', 404);
    }
    return new Customer(customer);
  }
}
