export interface WarehouseProps {
  id: string;
  name: string;
  code?: string;
  capacity?: number;
  createdAt: string;
  updatedAt: string;
}

export class Warehouse {
  constructor(private props: WarehouseProps) {}

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  toJSON(): WarehouseProps {
    return { ...this.props };
  }
}
