export interface ProductPriceProps {
    id?: number;
    productId: number;
    priceType: string;
    price: number;
    currency: string;
    validFrom: Date;
    validTo?: Date | null;
    isActive: boolean;
    createdAt?: Date;
}

export class ProductPrice {
    constructor(public readonly props: ProductPriceProps) { }

    get id(): number | undefined {
        return this.props.id;
    }

    get price(): number {
        return this.props.price;
    }
}
