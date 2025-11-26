export interface InventoryConfigProps {
    id?: number;
    productId: number;
    branchId: number;
    reorderPoint: number;
    minStock: number;
    maxStock: number;
    location?: string | null;
    isActive: boolean;
    createdAt?: Date;
}

export class InventoryConfig {
    constructor(public readonly props: InventoryConfigProps) { }

    get id(): number | undefined {
        return this.props.id;
    }
}
