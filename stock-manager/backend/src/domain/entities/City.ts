export interface CityProps {
    id: string;
    name: string;
    department: string;
    country: string;
}

export class City {
    constructor(public readonly props: CityProps) { }

    get id() { return this.props.id; }
    get name() { return this.props.name; }

    toJSON() {
        return { ...this.props };
    }
}
