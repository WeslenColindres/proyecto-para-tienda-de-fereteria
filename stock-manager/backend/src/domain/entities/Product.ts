export type ProductStatus = 'activo' | 'inactivo' | 'descontinuado';

export interface ProductProps {
  id: string;
  code: string;
  sku?: string;
  barcode?: string;
  name: string;
  description?: string;
  categoryId?: string;
  unitId?: string;
  supplierId?: string;
  cost: number;
  price: number;
  tax: number;
  unit: string;
  status: ProductStatus;
  stock: number;
  minStock: number;
  // Flags operativos
  isInventoriable?: boolean;
  isSellable?: boolean;
  isPurchasable?: boolean;
  // Configuración de inventario
  reorderPoint?: number;
  maxStock?: number;
  physicalLocation?: string;
  // Auditoría
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  createdBy?: string;
  updatedBy?: string;
  active?: boolean;
  imageUrl?: string;
}

export class Product {
  private props: ProductProps;

  constructor(props: ProductProps) {
    this.props = {
      ...props,
      sku: props.sku ?? props.code,
      barcode: props.barcode ?? props.code,
      isInventoriable: props.isInventoriable ?? true,
      isSellable: props.isSellable ?? true,
      isPurchasable: props.isPurchasable ?? true,
    };
  }

  get id(): string {
    return this.props.id;
  }

  get code(): string {
    return this.props.code;
  }

  get sku(): string | undefined {
    return this.props.sku;
  }

  get name(): string {
    return this.props.name;
  }

  get status(): ProductStatus {
    return this.props.status;
  }

  get price(): number {
    return this.props.price;
  }

  get cost(): number {
    return this.props.cost;
  }

  get stock(): number {
    return this.props.stock;
  }

  get minStock(): number {
    return this.props.minStock;
  }

  get imageUrl(): string | undefined {
    return this.props.imageUrl;
  }

  get isActive(): boolean {
    return (this.props.status !== 'descontinuado' && !this.props.deletedAt) || this.props.active === true;
  }

  changeStock(newStock: number): void {
    if (newStock < 0) {
      throw new Error('Stock no puede ser negativo');
    }
    this.props.stock = newStock;
    this.props.updatedAt = new Date().toISOString();
  }

  updateInfo(partial: Partial<Omit<ProductProps, 'id' | 'createdAt'>>): void {
    if (partial.name !== undefined) this.props.name = partial.name.trim();
    if (partial.price !== undefined) this.props.price = partial.price;
    if (partial.cost !== undefined) this.props.cost = partial.cost;
    if (partial.stock !== undefined) this.props.stock = partial.stock;
    if (partial.minStock !== undefined) this.props.minStock = partial.minStock;
    if (partial.description !== undefined) this.props.description = partial.description;
    if (partial.categoryId !== undefined) this.props.categoryId = partial.categoryId;
    if (partial.barcode !== undefined) this.props.barcode = partial.barcode;
    if (partial.tax !== undefined) this.props.tax = partial.tax;
    if (partial.unit !== undefined) this.props.unit = partial.unit;
    if (partial.status !== undefined) this.props.status = partial.status;
    if (partial.deletedAt !== undefined) this.props.deletedAt = partial.deletedAt;
    if (partial.updatedBy !== undefined) this.props.updatedBy = partial.updatedBy;
    if (partial.sku !== undefined) this.props.sku = partial.sku;
    if (partial.supplierId !== undefined) this.props.supplierId = partial.supplierId;
    if (partial.isInventoriable !== undefined) this.props.isInventoriable = partial.isInventoriable;
    if (partial.isSellable !== undefined) this.props.isSellable = partial.isSellable;
    if (partial.isPurchasable !== undefined) this.props.isPurchasable = partial.isPurchasable;
    if (partial.reorderPoint !== undefined) this.props.reorderPoint = partial.reorderPoint;
    if (partial.maxStock !== undefined) this.props.maxStock = partial.maxStock;
    if (partial.physicalLocation !== undefined) this.props.physicalLocation = partial.physicalLocation;
    if (partial.imageUrl !== undefined) this.props.imageUrl = partial.imageUrl;
    this.props.updatedAt = new Date().toISOString();
  }

  toJSON(): ProductProps {
    return { ...this.props, active: this.isActive };
  }
}
