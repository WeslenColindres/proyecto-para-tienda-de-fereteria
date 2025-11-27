export interface PermissionProps {
    id?: number;
    name: string;
    description?: string | null;
    module: string;
    resource: string;
    action: string;
    createdAt?: Date;
}

export class Permission {
    constructor(public readonly props: PermissionProps) { }

    get id(): number | undefined {
        return this.props.id;
    }

    get name(): string {
        return this.props.name;
    }

    get module(): string {
        return this.props.module;
    }

    get resource(): string {
        return this.props.resource;
    }

    get action(): string {
        return this.props.action;
    }

    toJSON(): PermissionProps {
        return { ...this.props };
    }
}
