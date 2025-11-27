export type PeriodStatus = 'ABIERTO' | 'CERRADO' | 'BLOQUEADO';

export interface AccountingPeriodProps {
    id?: number;
    year: number;
    month: number;
    name: string;
    startDate: Date;
    endDate: Date;
    status: PeriodStatus;
    isFiscalYearClosed: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export class AccountingPeriod {
    constructor(public readonly props: AccountingPeriodProps) { }

    get id(): number | undefined {
        return this.props.id;
    }

    get name(): string {
        return this.props.name;
    }

    get status(): PeriodStatus {
        return this.props.status;
    }

    isOpen(): boolean {
        return this.props.status === 'ABIERTO';
    }

    toJSON(): AccountingPeriodProps {
        return { ...this.props };
    }
}
