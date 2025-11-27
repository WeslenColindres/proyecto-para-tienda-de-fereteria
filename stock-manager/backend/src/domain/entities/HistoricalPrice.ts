export type PriceChangeReason = 'COMPRA' | 'AJUSTE' | 'OFERTA' | 'INFLACION' | 'OTRO';

export interface HistoricalPriceProps {
    id?: number;
    productId: number;
    oldPrice: number;
    newPrice: number;
    oldCost: number;
    newCost: number;
    reason: PriceChangeReason;
    changedByUserId: number;
    changedAt: Date;
}

export class HistoricalPrice {
    constructor(public readonly props: HistoricalPriceProps) { }

    get id(): number | undefined {
        return this.props.id;
    }

    get productId(): number {
        return this.props.productId;
    }

    get changedAt(): Date {
        return this.props.changedAt;
    }

    toJSON(): HistoricalPriceProps {
        return { ...this.props };
    }
}
