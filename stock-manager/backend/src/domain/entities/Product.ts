export type ProductStatus = 'activo' | 'inactivo' | 'descontinuado';

export interface ProductProps {
  id: string;
  code: string;
  name: string;
  description?: string;
  categoryId?: string;
  barcode?: string;
  cost: number;
  price: number;
  tax: number;
  unit: string;
  status: ProductStatus;
  stock: number;
  minStock: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  createdBy?: string;
  updatedBy?: string;
  active?: boolean;
}

export class Product {
  private props: ProductProps;

  constructor(props: ProductProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get code(): string {
    return this.props.code;
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

  get isActive(): boolean {
    return this.props.status !== 'descontinuado' && !this.props.deletedAt;
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
    this.props.updatedAt = new Date().toISOString();
  }

  toJSON(): ProductProps {
    return { ...this.props, active: this.isActive };
  }
}
