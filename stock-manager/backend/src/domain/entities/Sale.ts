export type SaleDocumentType = 'FACTURA' | 'FACTURA_NUEVO' | 'COMPROBANTE';
export type SaleStatus = 'pagada' | 'pendiente' | 'anulada';

export interface SaleItemProps {
  productId: string;
  code: string;
  name: string;
  qty: number;
  price: number;
  subtotal: number;
  lineNumber?: number;
  discountPercentage?: number;
  discountAmount?: number;
  lineSubtotal?: number;
  lineTaxTotal?: number;
  lineTotal?: number;
  costAtMoment?: number;
}

export interface SalePaymentProps {
  id?: string;
  saleId: string;
  paymentMethodId: string;
  amount: number;
  authorizationNumber?: string;
  referenceNumber?: string;
  bank?: string;
  checkNumber?: string;
  status: 'PENDIENTE' | 'ACREDITADO' | 'RECHAZADO';
  paymentDate: string;
  creditDate?: string;
  notes?: string;
}

export interface SaleProps {
  id: string;
  docNumber: string;
  docType: SaleDocumentType;
  datetime: string;
  clientName: string;
  clientNit: string;
  user: string;
  items: SaleItemProps[];
  subtotal: number;
  tax: number;
  total: number;
  status: SaleStatus;
  // FEL Guatemala
  internalUuid?: string;
  seriesId?: string;
  satUuid?: string;
  satAuthNumber?: string;
  satSeries?: string;
  satNumber?: number;
  certificationDate?: string;
  // Totales y descuentos
  totalDiscounts?: number;
  // Certificación
  requiresCertification?: boolean;
  certificationAttempts?: number;
  certificationError?: string;
  // Gestión
  dueDate?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  // Pagos
  payments?: SalePaymentProps[];
}

export class Sale {
  constructor(private props: SaleProps) {}

  get id(): string {
    return this.props.id;
  }

  get status(): SaleStatus {
    return this.props.status;
  }

  toJSON(): SaleProps {
    return { ...this.props, items: [...this.props.items] };
  }
}
