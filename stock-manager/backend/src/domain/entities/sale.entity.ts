export interface SaleProps {
    id?: number;
    internalUuid?: string;
    branchId: number;
    seriesId: number;
    documentNumber: string;
    documentType: string;
    clientId?: number | null;
    shippingAddressId?: number | null;
    sellerId?: number | null;
    satUuid?: string | null;
    satAuthNumber?: string | null;
    satSeries?: string | null;
    satNumber?: number | null;
    certificationDate?: Date | null;
    subtotal: number;
    totalDiscounts: number;
    totalTaxes: number;
    finalTotal: number;
    status: string;
    requiresCertification: boolean;
    certificationAttempts: number;
    certificationError?: string | null;
    observations?: string | null;
    saleDate: Date;
    dueDate?: Date | null;
    cancellationDate?: Date | null;
    cancellationReason?: string | null;
    cancelledByUserId?: number | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Sale {
    constructor(public readonly props: SaleProps) { }

    get id(): number | undefined {
        return this.props.id;
    }

    get documentNumber(): string {
        return this.props.documentNumber;
    }

    get finalTotal(): number {
        return this.props.finalTotal;
    }
}
