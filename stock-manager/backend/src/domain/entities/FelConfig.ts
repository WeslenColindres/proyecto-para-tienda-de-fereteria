export interface FelConfigProps {
    id?: number;
    branchId: number;
    certifierProvider: string;
    certifierNit?: string | null;
    certifierUser?: string | null;
    authToken: string;
    endpointUrl: string;
    backupUrl?: string | null;
    environmentType: 'PRODUCCION' | 'PRUEBAS';
    ivaAffiliation: string;
    establishmentCode: number;
    isActive: boolean;
    activationDate?: Date | null;
    expirationDate?: Date | null;
    createdAt?: Date;
}

export class FelConfig {
    constructor(public readonly props: FelConfigProps) { }

    get id(): number | undefined {
        return this.props.id;
    }

    get environmentType(): string {
        return this.props.environmentType;
    }

    isProduction(): boolean {
        return this.props.environmentType === 'PRODUCCION';
    }

    toJSON(): FelConfigProps {
        return { ...this.props };
    }
}
