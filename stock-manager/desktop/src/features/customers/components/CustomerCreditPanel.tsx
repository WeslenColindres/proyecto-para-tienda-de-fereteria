import { formatCurrency } from '@/shared/utils/format';
import type { CustomerItem, CustomerCreditRow } from '@/shared/types/customers';

type Props = {
  customer?: CustomerItem | null;
  creditRows: CustomerCreditRow[];
  onPay: () => void;
};

const CustomerCreditPanel = ({ customer, creditRows, onPay }: Props) => {
  const creditUsedPct = customer?.creditLimit ? Math.round(((customer.creditUsed ?? 0) / customer.creditLimit) * 100) : 0;

  return (
    <article className="customer-card">
      <header className="card-header">
        <div>
          <h3 style={{ margin: 0 }}>Estado de credito</h3>
          <small className="muted">{customer?.name ?? 'Selecciona un cliente'}</small>
        </div>
        <button className="customer-btn" onClick={onPay}>
          Registrar pago
        </button>
      </header>
      <div className="mini-kpi-grid">
        <div className="mini-kpi">
          <small>Limite</small>
          <strong>{formatCurrency(customer?.creditLimit ?? 0)}</strong>
        </div>
        <div className="mini-kpi">
          <small>Usado</small>
          <strong>{formatCurrency(customer?.creditUsed ?? 0)}</strong>
        </div>
        <div className="mini-kpi">
          <small>Disponible</small>
          <strong>{formatCurrency((customer?.creditLimit ?? 0) - (customer?.creditUsed ?? 0))}</strong>
        </div>
        <div className="mini-kpi">
          <small>Uso</small>
          <strong>{creditUsedPct}%</strong>
        </div>
      </div>

      <table className="report-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Limite</th>
            <th>Usado</th>
            <th>Disponible</th>
            <th>Dias</th>
          </tr>
        </thead>
        <tbody>
          {creditRows.map((row) => (
            <tr key={row.customer}>
              <td>{row.customer}</td>
              <td>{formatCurrency(row.limit)}</td>
              <td>{formatCurrency(row.used)}</td>
              <td>{formatCurrency(row.available)}</td>
              <td>{row.daysToDue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  );
};

export default CustomerCreditPanel;
