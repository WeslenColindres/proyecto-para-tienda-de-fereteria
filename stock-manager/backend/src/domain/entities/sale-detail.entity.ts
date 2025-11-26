export interface SaleDetailProps {
    id?: number;
    saleId: number;
    lineNumber: number;
    productId?: number | null;
    description: string;
    quantity: number;
    unitPrice: number;
    discountPercentage: number;
    discountAmount: number;
    lineSubtotal: number;
    lineTaxTotal: number;
    lineTotal: number;
    unitCostAtTime?: number | null;
    createdAt?: Date;
}

export class SaleDetail {
    constructor(public readonly props: SaleDetailProps) { }

    get id(): number | undefined {
        return this.props.id;
    }

    get lineTotal(): number {
        return this.props.lineTotal;
    }
}
