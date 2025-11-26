import type { StoreGateway } from '../../ports/StoreGateway';

export class GetSupplierReport {
  constructor(private readonly store: StoreGateway) {}

  async execute(params: { from?: string; to?: string } = {}) {
    const data = await this.store.readStore();
    const fromDate = params.from ? new Date(params.from) : null;
    const toDate = params.to ? new Date(params.to) : null;

    const filteredPurchases = data.supplierPurchases.filter((purchase) => {
      const date = new Date(purchase.date);
      if (fromDate && date < fromDate) return false;
      if (toDate && date > toDate) return false;
      return true;
    });

    const totalsBySupplier = filteredPurchases.reduce<Record<string, { amount: number; lastPurchase: string; lastDocument?: string }>>(
      (acc, purchase) => {
        if (!acc[purchase.supplierId]) {
          acc[purchase.supplierId] = { amount: 0, lastPurchase: purchase.date, lastDocument: purchase.documentNumber };
        }
        acc[purchase.supplierId].amount += purchase.amount;
        if (purchase.date > acc[purchase.supplierId].lastPurchase) {
          acc[purchase.supplierId].lastPurchase = purchase.date;
          acc[purchase.supplierId].lastDocument = purchase.documentNumber;
        }
        return acc;
      },
      {},
    );

    const totalAmount = Object.values(totalsBySupplier).reduce((acc, item) => acc + item.amount, 0);

    const rows = Object.entries(totalsBySupplier)
      .map(([supplierId, info]) => {
        const supplier = data.suppliers.find((s) => s.id === supplierId);
        return {
          supplier: supplier?.name ?? supplierId,
          purchases: info.amount,
          share: totalAmount > 0 ? Math.round((info.amount / totalAmount) * 100) : 0,
          lastPurchase: info.lastPurchase,
          state: supplier?.status ?? 'N/D',
        };
      })
      .sort((a, b) => (a.purchases > b.purchases ? -1 : 1));

    const kpis = [
      { label: 'Compras totales', value: `Q${totalAmount.toLocaleString('es-GT')}` },
      { label: 'Promedio mensual', value: `Q${Math.round(totalAmount / 12).toLocaleString('es-GT')}` },
      { label: 'Proveedor principal', value: rows[0] ? `${rows[0].supplier} (${rows[0].share}%)` : 'N/D' },
    ];

    return { rows, kpis, totalAmount };
  }
}
