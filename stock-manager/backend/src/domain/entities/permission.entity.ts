export interface PermissionProps {
    id?: number;
    module: string;
    action: string;
    description?: string | null;
}

export class Permission {
    constructor(public readonly props: PermissionProps) { }

    get id(): number | undefined {
        return this.props.id;
    }

    get module(): string {
        return this.props.module;
    }

    get action(): string {
        return this.props.action;
    }

    get description(): string | null | undefined {
        return this.props.description;
    }
}
