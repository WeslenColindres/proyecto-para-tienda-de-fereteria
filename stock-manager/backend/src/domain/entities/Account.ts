export type AccountType = 'ACTIVO' | 'PASIVO' | 'PATRIMONIO' | 'INGRESO' | 'EGRESO' | 'COSTO';
export type AccountNature = 'DEUDORA' | 'ACREEDORA';

export interface AccountProps {
    id?: number;
    code: string;
    name: string;
    parentId?: number | null;
    level: number;
    type: AccountType;
    nature: AccountNature;
    acceptsMovement: boolean;
    requiresCostCenter: boolean;
    requiresThirdParty: boolean;
    isActive: boolean;
    description?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Account {
    constructor(public readonly props: AccountProps) { }

    get id(): number | undefined {
        return this.props.id;
    }

    get code(): string {
        return this.props.code;
    }

    get name(): string {
        return this.props.name;
    }

    get type(): AccountType {
        return this.props.type;
    }

    get nature(): AccountNature {
        return this.props.nature;
    }

    get isActive(): boolean {
        return this.props.isActive;
    }

    toJSON(): AccountProps {
        return { ...this.props };
    }
}
