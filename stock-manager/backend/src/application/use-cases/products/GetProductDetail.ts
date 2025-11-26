import { Product } from '../../../domain/entities/Product';
import { DomainError } from '../../../domain/errors/DomainError';
import type { StoreGateway } from '../../ports/StoreGateway';

export class GetProductDetail {
  constructor(private readonly store: StoreGateway) {}

  async execute(id: string) {
    if (!id) throw new DomainError('VALIDATION_ERROR', 'Id requerido', 400);

    const data = await this.store.readStore();
    const product = data.products.find((p) => p.id === id);
    if (!product) throw new DomainError('PRODUCT_NOT_FOUND', 'Producto no encontrado', 404);

    const stockByWarehouse = data.productStock
      .filter((ps) => ps.productId === id)
      .map((ps) => ({
        ...ps,
        warehouseName: data.warehouses.find((w) => w.id === ps.warehouseId)?.name ?? 'Almacen',
      }));

    const movements = data.inventoryMovements
      .filter((m) => m.productId === id)
      .sort((a, b) => (a.datetime > b.datetime ? -1 : 1))
      .slice(0, 20);

    const alerts = data.alerts.filter((a) => a.productId === id);

    return {
      product: new Product(product).toJSON(),
      stockByWarehouse,
      movements,
      alerts,
    };
  }
}
