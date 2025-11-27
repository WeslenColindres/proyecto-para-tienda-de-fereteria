export interface SystemConfigProps {
    id?: number;
    key: string;
    value: string;
    description?: string;
    updatedAt?: Date;
}

export class SystemConfig {
    constructor(public props: SystemConfigProps) { }

    get id(): number | undefined {
        return this.props.id;
    }

    get key(): string {
        return this.props.key;
    }

    get value(): string {
        return this.props.value;
    }

    get description(): string | undefined {
        return this.props.description;
    }
}
