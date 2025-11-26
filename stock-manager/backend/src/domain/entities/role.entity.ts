export interface RoleProps {
    id?: number;
    name: string;
    description?: string | null;
    createdAt?: Date;
}

export class Role {
    constructor(public readonly props: RoleProps) { }

    get id(): number | undefined {
        return this.props.id;
    }

    get name(): string {
        return this.props.name;
    }

    get description(): string | null | undefined {
        return this.props.description;
    }
}
