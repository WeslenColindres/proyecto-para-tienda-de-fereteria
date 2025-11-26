import { DomainError } from '../../../domain/errors/DomainError';
import type { StoreGateway } from '../../ports/StoreGateway';
import { pushAuditLog } from '../../utils/audit';

export class DeleteCategory {
  constructor(private readonly store: StoreGateway) {}

  async execute(id: string) {
    if (!id) throw new DomainError('VALIDATION_ERROR', 'Id requerido', 400);

    return this.store.withStoreLock((store) => {
      const category = store.categories.find((c) => c.id === id);
      if (!category) throw new DomainError('CATEGORY_NOT_FOUND', 'Categoria no encontrada', 404);
      const before = { ...category };
      category.deletedAt = new Date().toISOString();
      category.status = 'inactivo';

      pushAuditLog(store, {
        action: 'category_delete',
        entityType: 'category',
        entityId: id,
        before,
        after: category,
      });

      return category;
    });
  }
}
