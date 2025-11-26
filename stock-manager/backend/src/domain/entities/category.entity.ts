export interface CategoryProps {
    id?: number;
    name: string;
    description?: string | null;
    parentId?: number | null;
    isActive: boolean;
    createdAt?: Date;
}

export class Category {
    constructor(public readonly props: CategoryProps) { }

    get id(): number | undefined {
        return this.props.id;
    }

    get name(): string {
        return this.props.name;
    }
}
