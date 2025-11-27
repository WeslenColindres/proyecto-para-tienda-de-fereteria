import { Role } from './Role';

export type UserType = 'TRABAJADOR' | 'CLIENTE_WEB' | 'API' | 'SISTEMA';

export interface UserProps {
    id?: number;
    username: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    type: UserType;
    roles?: Role[];
    isActive: boolean;
    lastLogin?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export class User {
    constructor(public readonly props: UserProps) { }

    get id(): number | undefined {
        return this.props.id;
    }

    get username(): string {
        return this.props.username;
    }

    get email(): string {
        return this.props.email;
    }

    get fullName(): string {
        return `${this.props.firstName} ${this.props.lastName}`;
    }

    get type(): UserType {
        return this.props.type;
    }

    get roles(): Role[] {
        return this.props.roles || [];
    }

    get isActive(): boolean {
        return this.props.isActive;
    }

    hasRole(roleName: string): boolean {
        return this.roles.some(role => role.name === roleName);
    }

    toJSON(): UserProps {
        return { ...this.props };
    }
}
