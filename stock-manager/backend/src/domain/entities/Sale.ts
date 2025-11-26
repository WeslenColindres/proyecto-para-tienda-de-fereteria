export type SaleDocumentType = 'FACTURA' | 'FACTURA_NUEVO' | 'COMPROBANTE';
export type SaleStatus = 'pagada' | 'pendiente' | 'anulada';

export interface SaleItemProps {
  productId: string;
  code: string;
  name: string;
  qty: number;
  price: number;
  subtotal: number;
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

