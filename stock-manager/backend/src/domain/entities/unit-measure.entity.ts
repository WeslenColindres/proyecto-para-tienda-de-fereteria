export interface UnitOfMeasureProps {
    id?: number;
    code: string;
    name: string;
    description?: string | null;
}

export class UnitOfMeasure {
    constructor(public readonly props: UnitOfMeasureProps) { }

    get id(): number | undefined {
        return this.props.id;
    }

    get code(): string {
        return this.props.code;
    }

    get name(): string {
        return this.props.name;
    }
}
