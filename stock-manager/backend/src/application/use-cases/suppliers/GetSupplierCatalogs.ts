import type { StoreGateway } from '../../ports/StoreGateway';

export class GetSupplierCatalogs {
  constructor(private readonly store: StoreGateway) {}

  async execute() {
    const data = await this.store.readStore();
    return {
      cities: data.cities,
      categories: data.supplierCategories.filter((cat) => cat.status !== 'inactivo'),
    };
  }
}
