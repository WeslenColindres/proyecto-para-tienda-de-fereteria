import type { AlertProps } from '../../domain/entities/Alert';
import type { AuditLogProps } from '../../domain/entities/AuditLog';
import type { CategoryProps } from '../../domain/entities/Category';
import type { InventoryMovementProps } from '../../domain/entities/InventoryMovement';
import type { CustomerProps } from '../../domain/entities/Customer';
import type { ProductProps } from '../../domain/entities/Product';
import type { ProductStock } from '../../domain/entities/ProductStock';
import type { SaleProps } from '../../domain/entities/Sale';
import type { SupplierProps } from '../../domain/entities/Supplier';
import type { SupplierPurchaseProps } from '../../domain/entities/SupplierPurchase';
import type { City, SupplierCategory } from '../../domain/entities/SupplierCatalog';
import type { WarehouseProps } from '../../domain/entities/Warehouse';

export interface StoreSchema {
  products: ProductProps[];
  categories: CategoryProps[];
  warehouses: WarehouseProps[];
  productStock: ProductStock[];
  inventoryMovements: InventoryMovementProps[];
  alerts: AlertProps[];
  auditLogs: AuditLogProps[];
  sales: SaleProps[];
  suppliers: SupplierProps[];
  supplierPurchases: SupplierPurchaseProps[];
  supplierCategories: SupplierCategory[];
  cities: City[];
  customers: CustomerProps[];
}

export interface StoreGateway {
  readStore(): Promise<StoreSchema>;
  withStoreLock<T>(fn: (store: StoreSchema) => T | Promise<T>): Promise<T>;
}
