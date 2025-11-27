export interface SupplierCategoryProps {
    id: string;
    code: string;
    name: string;
    description?: string;
    active: boolean;
}

export class SupplierCategory {
    constructor(public readonly props: SupplierCategoryProps) { }

    get id() { return this.props.id; }
    get name() { return this.props.name; }

    toJSON() {
        return { ...this.props };
    }
}
