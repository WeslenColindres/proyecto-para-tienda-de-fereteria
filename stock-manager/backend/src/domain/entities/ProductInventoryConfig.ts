// Configuración avanzada de inventario por producto
export interface ProductInventoryConfig {
  productId: string;
  reorderPoint?: number;
  maxStock?: number;
  physicalLocation?: string;
  isInventoriable?: boolean;
  isSellable?: boolean;
  isPurchasable?: boolean;
}
