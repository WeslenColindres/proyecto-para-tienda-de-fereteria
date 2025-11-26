import type { CustomerSaleRow } from '@/shared/types/customers';
import { formatCurrency } from '@/shared/utils/format';

type Props = {
  sales: CustomerSaleRow[];
  onOpenOrders: () => void;
};

const CustomerSalesPanel = ({ sales, onOpenOrders }: Props) => {
  return (
    <article className="customer-card">
      <header className="card-header">
        <h3 style={{ margin: 0 }}>Historial de compras</h3>
        <button className="customer-btn" onClick={onOpenOrders}>
          Ver mas
        </button>
      </header>
      <ul>
        {sales.map((sale) => (
          <li key={sale.document} className="purchase-row">
            <div>
              <strong>{sale.date}</strong> {sale.document}
              <div className="purchase-meta">{sale.type}</div>
            </div>
            <div className="balance">{formatCurrency(sale.amount)}</div>
            <span className={`purchase-status ${sale.status}`}>{sale.status}</span>
          </li>
        ))}
        {!sales.length && <li className="muted">Sin compras registradas</li>}
      </ul>
    </article>
  );
};

export default CustomerSalesPanel;
