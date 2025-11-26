export interface AuditLogProps {
  id: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
  createdAt: string;
}

export class AuditLog {
  constructor(private props: AuditLogProps) {}

  toJSON(): AuditLogProps {
    return { ...this.props };
  }
}
