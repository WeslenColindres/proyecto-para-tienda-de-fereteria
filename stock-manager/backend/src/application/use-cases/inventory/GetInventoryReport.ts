import type { StoreGateway } from '../../ports/StoreGateway';
import { roundMoney } from '../../utils/money';

export interface InventoryReport {
  overview: {
    inventoryValue: number;
    productsWithStock: string;
    lowStock: string;
    rotation: string;
  };
  detail: Array<{
    product: string;
    stock: number;
    value: number;
    last: string;
    rotation: string;
    warehouse: string;
  }>;
  warehouses: Array<{
    warehouse: string;
    products: number;
    value: number;
    percentage: number;
    capacity: number;
  }>;
  alerts: Array<{
    id: string;
    type: string;
    level: string;
    message: string;
    productId?: string;
    createdAt: string;
  }>;
}

export class GetInventoryReport {
  constructor(private readonly store: StoreGateway) {}

  async execute(): Promise<InventoryReport> {
    const data = await this.store.readStore();

    const inventoryValue = roundMoney(
      data.products.reduce((acc, product) => acc + roundMoney((product.cost ?? 0) * (product.stock ?? 0)), 0),
    );

    const productsWithStock = data.products.filter((p) => p.stock > 0);
    const lowStockProducts = data.products.filter((p) => p.stock <= p.minStock);
    const lowStockPct = data.products.length
      ? Math.round((lowStockProducts.length / data.products.length) * 100)
      : 0;

    const detail = data.productStock.map((stock) => {
      const product = data.products.find((p) => p.id === stock.productId);
      const warehouse = data.warehouses.find((w) => w.id === stock.warehouseId);
      const value = roundMoney((product?.cost ?? 0) * (stock.stock ?? 0));
      const rotation =
        stock.stock === 0 ? 'Sin movimiento' : stock.stock < (product?.minStock ?? 0) ? 'Baja' : 'Media';

      return {
        product: product?.name ?? stock.productId,
        stock: stock.stock,
        value,
        last: stock.lastMovementAt ?? 'N/D',
        rotation,
        warehouse: warehouse?.name ?? 'Almacen',
      };
    });

    const warehouseTotals = data.warehouses.map((wh) => {
      const entries = data.productStock.filter((ps) => ps.warehouseId === wh.id);
      const value = entries.reduce((acc, ps) => {
        const product = data.products.find((p) => p.id === ps.productId);
        return acc + (product?.cost ?? 0) * ps.stock;
      }, 0);
      return {
        warehouse: wh.name,
        products: entries.length,
        value: roundMoney(value),
        percentage: data.productStock.length ? Math.round((entries.length / data.productStock.length) * 100) : 0,
        capacity: wh.capacity ?? 0,
      };
    });

    return {
      overview: {
        inventoryValue,
        productsWithStock: `${productsWithStock.length}/${data.products.length}`,
        lowStock: `${lowStockProducts.length} (${lowStockPct}%)`,
        rotation: 'N/D',
      },
      detail,
      warehouses: warehouseTotals,
      alerts: data.alerts.map((a) => ({
        id: a.id,
        type: a.type,
        level: a.level,
        message: a.message,
        productId: a.productId,
        createdAt: a.createdAt,
      })),
    };
  }
}
