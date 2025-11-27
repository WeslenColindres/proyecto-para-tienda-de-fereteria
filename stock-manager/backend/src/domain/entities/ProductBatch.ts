export interface ProductBatchProps {
    id?: number;
    productId: number;
    batchNumber: string;
    expirationDate?: Date | null;
    quantity: number;
    cost: number;
    location?: string | null;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export class ProductBatch {
    constructor(public readonly props: ProductBatchProps) { }

    get id(): number | undefined {
        return this.props.id;
    }

    get batchNumber(): string {
        return this.props.batchNumber;
    }

    get quantity(): number {
        return this.props.quantity;
    }

    get isActive(): boolean {
        return this.props.isActive;
    }

    isExpired(): boolean {
        if (!this.props.expirationDate) return false;
        return this.props.expirationDate < new Date();
    }

    toJSON(): ProductBatchProps {
        return { ...this.props };
    }
}
