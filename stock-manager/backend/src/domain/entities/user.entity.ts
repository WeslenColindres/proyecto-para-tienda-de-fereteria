export interface UserProps {
    id?: number;
    username: string;
    passwordHash: string;
    email?: string | null;
    fullName: string;
    roleId: number;
    isActive: boolean;
    lastAccess?: Date | null;
    failedAttempts: number;
    lockedUntil?: Date | null;
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

    get passwordHash(): string {
        return this.props.passwordHash;
    }

    get email(): string | null | undefined {
        return this.props.email;
    }

    get fullName(): string {
        return this.props.fullName;
    }

    get roleId(): number {
        return this.props.roleId;
    }

    get isActive(): boolean {
        return this.props.isActive;
    }

    isLocked(): boolean {
        if (!this.props.lockedUntil) return false;
        return this.props.lockedUntil > new Date();
    }

    incrementFailedAttempts(): void {
        this.props.failedAttempts++;
    }

    resetFailedAttempts(): void {
        this.props.failedAttempts = 0;
        this.props.lockedUntil = null;
    }

    lock(durationMinutes: number = 15): void {
        const lockTime = new Date();
        lockTime.setMinutes(lockTime.getMinutes() + durationMinutes);
        this.props.lockedUntil = lockTime;
    }
}
