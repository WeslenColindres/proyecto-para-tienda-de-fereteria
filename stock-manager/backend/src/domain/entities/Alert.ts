export type AlertType = 'stock_low' | 'stock_critical' | 'stock_preventive' | 'system_update' | 'custom';
export type AlertLevel = 'info' | 'warning' | 'error' | 'critical';

export interface AlertProps {
  id: string;
  type: AlertType;
  level: AlertLevel;
  message: string;
  productId?: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
}

export class Alert {
  constructor(private props: AlertProps) {}

  markAsRead(): AlertProps {
    this.props.isRead = true;
    this.props.readAt = new Date().toISOString();
    return this.props;
  }

  toJSON(): AlertProps {
    return { ...this.props };
  }
}
