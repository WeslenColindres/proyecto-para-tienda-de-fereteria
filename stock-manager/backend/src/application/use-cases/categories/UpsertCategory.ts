import { randomUUID } from 'node:crypto';
import { DomainError } from '../../../domain/errors/DomainError';
import type { StoreGateway } from '../../ports/StoreGateway';
import { pushAuditLog } from '../../utils/audit';

export interface UpsertCategoryInput {
  id?: string;
  code: string;
  name: string;
  description?: string;
  color?: string;
  status?: 'activo' | 'inactivo';
}

export class UpsertCategory {
  constructor(private readonly store: StoreGateway) {}

  async execute(input: UpsertCategoryInput) {
    if (!input.code?.trim() || !input.name?.trim()) {
      throw new DomainError('VALIDATION_ERROR', 'Codigo y nombre de categoria son obligatorios', 400);
    }

    return this.store.withStoreLock((store) => {
      const normalizedCode = input.code.trim();
      const normalizedName = input.name.trim();
      const now = new Date().toISOString();

      if (input.id) {
        const category = store.categories.find((c) => c.id === input.id);
        if (!category) throw new DomainError('CATEGORY_NOT_FOUND', 'Categoria no encontrada', 404);

        const duplicated = store.categories.some(
          (c) => c.id !== input.id && c.code === normalizedCode && !c.deletedAt,
        );
        if (duplicated) throw new DomainError('DUPLICATE_CODE', 'Codigo de categoria duplicado', 409);

        const before = { ...category };
        category.code = normalizedCode;
        category.name = normalizedName;
        if (input.description !== undefined) category.description = input.description;
        if (input.color !== undefined) category.color = input.color;
        if (input.status !== undefined) category.status = input.status;
        category.updatedAt = now;

        pushAuditLog(store, {
          action: 'category_update',
          entityType: 'category',
          entityId: category.id,
          before,
          after: category,
        });
        return category;
      }

      const duplicated = store.categories.some((c) => c.code === normalizedCode && !c.deletedAt);
      if (duplicated) throw new DomainError('DUPLICATE_CODE', 'Codigo de categoria duplicado', 409);

      const category = {
        id: randomUUID(),
        code: normalizedCode,
        name: normalizedName,
        description: input.description ?? '',
        color: input.color ?? '#0ea5e9',
        status: input.status ?? 'activo',
        createdAt: now,
        updatedAt: now,
      };
      store.categories.push(category);

      pushAuditLog(store, {
        action: 'category_create',
        entityType: 'category',
        entityId: category.id,
        before: null,
        after: category,
      });

      return category;
    });
  }
}
