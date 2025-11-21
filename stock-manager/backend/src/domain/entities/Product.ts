export interface ProductProps {
  id: string;
  code: string;
  name: string;
  price: number;
  stock: number;
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

  get price(): number {
    return this.props.price;
  }

  get stock(): number {
    return this.props.stock;
  }

  changeStock(newStock: number): void {
    if (newStock < 0) {
      throw new Error('Stock no puede ser negativo');
    }
    this.props.stock = newStock;
  }

  toJSON() {
    return { ...this.props };
  }
}
