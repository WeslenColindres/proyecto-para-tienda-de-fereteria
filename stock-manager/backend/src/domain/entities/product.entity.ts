export interface ProductProps {
    id?: number;
    sku: string;
    barcode?: string | null;
    name: string;
    description?: string | null;
    categoryId?: number | null;
    unitOfMeasureId?: number | null;
    mainProviderId?: number | null;
    isInventoriable: boolean;
    isSellable: boolean;
    isBuyable: boolean;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Product {
    constructor(public readonly props: ProductProps) { }

    get id(): number | undefined {
        return this.props.id;
    }

    get sku(): string {
        return this.props.sku;
    }

    get name(): string {
        return this.props.name;
    }

    get isInventoriable(): boolean {
        return this.props.isInventoriable;
    }
}
