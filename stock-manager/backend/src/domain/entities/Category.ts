export type CategoryStatus = 'activo' | 'inactivo';

export interface CategoryProps {
  id: string;
  code: string;
  name: string;
  description?: string;
  color?: string;
  status: CategoryStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export class Category {
  constructor(private props: CategoryProps) {}

  get id(): string {
    return this.props.id;
  }

  get code(): string {
    return this.props.code;
  }

  get name(): string {
    return this.props.name;
  }

  get status(): CategoryStatus {
    return this.props.status;
  }

  update(partial: Partial<Omit<CategoryProps, 'id' | 'createdAt'>>): CategoryProps {
    if (partial.code !== undefined) this.props.code = partial.code.trim();
    if (partial.name !== undefined) this.props.name = partial.name.trim();
    if (partial.description !== undefined) this.props.description = partial.description;
    if (partial.color !== undefined) this.props.color = partial.color;
    if (partial.status !== undefined) this.props.status = partial.status;
    if (partial.deletedAt !== undefined) this.props.deletedAt = partial.deletedAt;
    this.props.updatedAt = new Date().toISOString();
    return this.props;
  }

  toJSON(): CategoryProps {
    return { ...this.props };
  }
}
