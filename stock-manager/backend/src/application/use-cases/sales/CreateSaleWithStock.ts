import { randomUUID } from 'node:crypto';
import { Sale } from '../../../domain/entities/Sale';
import type { SaleDocumentType } from '../../../domain/entities/Sale';
import { DomainError } from '../../../domain/errors/DomainError';
import type { StoreGateway } from '../../ports/StoreGateway';
import { generateDocNumber } from '../../utils/docNumber';
import { roundMoney } from '../../utils/money';
import { syncStockAlerts } from '../../utils/stockAlerts';
import { pushAuditLog } from '../../utils/audit';

const saleDocPlaceholder = () => 'VENTA';

export interface NewSaleItemInput {
  productId: string;
  qty: number;
  price?: number;
}

export interface NewSaleInput {
  docType: SaleDocumentType;
  clientName: string;
  clientNit: string;
  user: string;
  items: NewSaleItemInput[];
}

export class CreateSaleWithStock {
  constructor(private readonly store: StoreGateway) {}

  async execute(input: NewSaleInput): Promise<Sale> {
    this.validateInput(input);

    const sale = await this.store.withStoreLock((store) => {
      const docNumber = generateDocNumber(store);
      const saleItems = input.items.map((item) => {
        const product = store.products.find((p) => p.id === item.productId);
        if (!product) {
          throw new DomainError('PRODUCT_NOT_FOUND', `Producto no encontrado: ${item.productId}`, 404);
        }
        if (product.status !== 'activo') {
          throw new DomainError('PRODUCT_INACTIVE', `Producto inactivo: ${product.code}`, 409);
        }
        if (product.stock < item.qty) {
          throw new DomainError(
            'NO_STOCK',
            `No hay stock suficiente para ${product.code}. Stock actual: ${product.stock}, solicitado: ${item.qty}`,
            409,
          );
        }

        const price = typeof item.price === 'number' ? item.price : product.price;
        const subtotal = roundMoney(price * item.qty);

        return {
          productId: product.id,
          code: product.code,
          name: product.name,
          qty: item.qty,
          price: roundMoney(price),
          subtotal,
        };
      });

      saleItems.forEach((item) => {
        const product = store.products.find((p) => p.id === item.productId);
        if (product) {
          product.stock -= item.qty;
          const stockEntry = store.productStock.find((ps) => ps.productId === product.id);
          if (stockEntry) {
            stockEntry.stock -= item.qty;
            stockEntry.lastMovementAt = new Date().toISOString();
          }
          store.inventoryMovements.push({
            id: randomUUID(),
            productId: product.id,
            warehouseId: stockEntry?.warehouseId ?? store.warehouses[0]?.id ?? 'wh-main',
            type: 'salida',
            qty: item.qty * -1,
            balance: product.stock,
            document: docNumber,
            datetime: new Date().toISOString(),
            createdBy: input.user,
          });
          syncStockAlerts(store, product);
          pushAuditLog(store, {
            action: 'stock_out',
            entityType: 'product',
            entityId: product.id,
            before: null,
            after: { stock: product.stock },
          });
        }
      });

      const subtotal = roundMoney(saleItems.reduce((acc, it) => acc + it.subtotal, 0));
      const tax = roundMoney(subtotal * 0.12);
      const total = roundMoney(subtotal + tax);

      const saleProps = {
        id: randomUUID(),
        docNumber,
        docType: input.docType,
        datetime: new Date().toISOString(),
        clientName: input.clientName.trim(),
        clientNit: input.clientNit.trim(),
        user: input.user.trim(),
        items: saleItems,
        subtotal,
        tax,
        total,
        status: 'pagada' as const,
      };

      store.sales.push(saleProps);
      return new Sale(saleProps);
    });

    return sale;
  }

  private validateInput(input: NewSaleInput) {
    if (!input.docType) throw new DomainError('VALIDATION_ERROR', 'Tipo de documento requerido', 400);
    if (!input.clientName?.trim()) throw new DomainError('VALIDATION_ERROR', 'Nombre de cliente requerido', 400);
    if (!input.clientNit?.trim()) throw new DomainError('VALIDATION_ERROR', 'NIT requerido', 400);
    if (!input.user?.trim()) throw new DomainError('VALIDATION_ERROR', 'Usuario requerido', 400);
    if (!Array.isArray(input.items) || input.items.length === 0) {
      throw new DomainError('VALIDATION_ERROR', 'La venta debe tener al menos un item', 400);
    }
    input.items.forEach((item) => {
      if (!item.productId) {
        throw new DomainError('VALIDATION_ERROR', 'Item sin productId', 400);
      }
      if (item.qty <= 0) {
        throw new DomainError('VALIDATION_ERROR', 'Cantidad debe ser mayor que 0', 400);
      }
    });
  }
}
