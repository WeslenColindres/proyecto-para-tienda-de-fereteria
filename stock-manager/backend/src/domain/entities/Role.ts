export type RoleType = 'INTERNO' | 'WEB' | 'API' | 'MOVIL';

export interface RoleProps {
    id?: number;
    name: string;
    description?: string | null;
    type: RoleType;
    accessLevel: number;
    isActive: boolean;
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

    get type(): RoleType {
        return this.props.type;
    }

    get accessLevel(): number {
        return this.props.accessLevel;
    }

    get isActive(): boolean {
        return this.props.isActive;
    }

    toJSON(): RoleProps {
        return { ...this.props };
    }
}
