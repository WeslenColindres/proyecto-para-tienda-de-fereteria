import type { StoreGateway } from '../../ports/StoreGateway';

export class ListCategories {
  constructor(private readonly store: StoreGateway) {}

  async execute(includeInactive = false) {
    const data = await this.store.readStore();
    const list = includeInactive
      ? data.categories
      : data.categories.filter((cat) => cat.status === 'activo' && !cat.deletedAt);
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }
}
