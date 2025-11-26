export interface StockProps {
    id?: number;
    productId: number;
    branchId: number;
    quantityAvailable: number;
    quantityReserved: number;
    quantityInTransit: number;
    lastUpdatedAt?: Date;
}

export class Stock {
    constructor(public readonly props: StockProps) { }

    get id(): number | undefined {
        return this.props.id;
    }

    get quantityAvailable(): number {
        return this.props.quantityAvailable;
    }
}
