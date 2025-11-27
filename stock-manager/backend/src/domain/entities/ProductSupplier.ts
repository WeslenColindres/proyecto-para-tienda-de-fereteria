export interface ProductSupplierProps {
    productId: number;
    supplierId: number;
    supplierProductCode?: string;
    costPrice: number;
    currency: string;
    isMainSupplier: boolean;
    lastPurchaseDate?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export class ProductSupplier {
    constructor(public props: ProductSupplierProps) { }

    get productId(): number {
        return this.props.productId;
    }

    get supplierId(): number {
        return this.props.supplierId;
    }

    get costPrice(): number {
        return this.props.costPrice;
    }

    get isMainSupplier(): boolean {
        return this.props.isMainSupplier;
    }
}
