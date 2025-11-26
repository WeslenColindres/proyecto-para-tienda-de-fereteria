import { randomUUID } from 'node:crypto';
import { Supplier } from '../../../domain/entities/Supplier';
import type { SupplierProps } from '../../../domain/entities/Supplier';
import { DomainError } from '../../../domain/errors/DomainError';
import type { StoreGateway } from '../../ports/StoreGateway';
import { pushAuditLog } from '../../utils/audit';

export type NewSupplierInput = Omit<SupplierProps, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'deletedBy' | 'lastPurchase' | 'lastDocument'> & {
  lastPurchase?: string;
  lastDocument?: string;
};

export class CreateSupplier {
  constructor(private readonly store: StoreGateway) {}

  async execute(input: NewSupplierInput): Promise<Supplier> {
    this.validate(input);

    const supplier = await this.store.withStoreLock((store) => {
      const existsNit = store.suppliers.find((s) => s.nit === input.nit && !s.deletedAt);
      if (existsNit) {
        throw new DomainError('SUPPLIER_DUPLICATE', 'Ya existe un proveedor con ese NIT', 409);
      }

      const existsEmail = input.email ? store.suppliers.find((s) => s.email === input.email && !s.deletedAt) : null;
      if (existsEmail) {
        throw new DomainError('SUPPLIER_DUPLICATE', 'Ya existe un proveedor con ese email', 409);
      }

      const nowIso = new Date().toISOString();
      const supplierProps: SupplierProps = {
        id: randomUUID(),
        nit: input.nit.trim(),
        name: input.name.trim(),
        contactName: input.contactName?.trim() ?? '',
        phone: input.phone?.trim() ?? '',
        email: input.email?.trim() ?? '',
        cityId: input.cityId,
        categoryId: input.categoryId,
        address: input.address ?? '',
        creditDays: input.creditDays ?? 0,
        creditLimit: input.creditLimit ?? 0,
        status: input.status ?? 'activo',
        balance: input.balance ?? 0,
        overdueDays: input.overdueDays ?? 0,
        lastPurchase: input.lastPurchase,
        lastDocument: input.lastDocument,
        createdAt: nowIso,
        updatedAt: nowIso,
        deletedAt: null,
        deletedBy: null,
      };

      store.suppliers.push(supplierProps);
      pushAuditLog(store, {
        action: 'create',
        entityType: 'supplier',
        entityId: supplierProps.id,
        before: null,
        after: supplierProps,
      });

      return new Supplier(supplierProps);
    });

    return supplier;
  }

  private validate(input: NewSupplierInput) {
    if (!input.nit?.trim()) {
      throw new DomainError('VALIDATION_ERROR', 'NIT requerido', 400);
    }
    if (!input.name?.trim()) {
      throw new DomainError('VALIDATION_ERROR', 'Nombre requerido', 400);
    }
    if (!input.cityId) {
      throw new DomainError('VALIDATION_ERROR', 'Ciudad requerida', 400);
    }
    if (!input.categoryId) {
      throw new DomainError('VALIDATION_ERROR', 'Categoria requerida', 400);
    }
  }
}
