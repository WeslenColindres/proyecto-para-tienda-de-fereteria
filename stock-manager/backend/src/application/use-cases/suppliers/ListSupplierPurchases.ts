import { SupplierPurchase } from '../../../domain/entities/SupplierPurchase';
import type { StoreGateway } from '../../ports/StoreGateway';

export class ListSupplierPurchases {
  constructor(private readonly store: StoreGateway) {}

  async execute(supplierId: string, limit?: number) {
    const data = await this.store.readStore();
    const purchases = data.supplierPurchases
      .filter((p) => p.supplierId === supplierId)
      .sort((a, b) => (a.date > b.date ? -1 : 1));

    const list = typeof limit === 'number' && limit > 0 ? purchases.slice(0, limit) : purchases;
    return list.map((p) => new SupplierPurchase(p));
  }
}
