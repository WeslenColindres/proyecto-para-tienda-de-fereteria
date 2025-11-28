import { useMemo } from 'react';
import { formatCurrency } from '@/shared/utils/format';
import type { CustomerItem, CustomerCreditRow } from '@/shared/types/customers';
import { DataTable, type Column } from '@/ui/molecules/Table/DataTable';

type Props = {
  customer?: CustomerItem | null;
  creditRows: CustomerCreditRow[];
  onPay: () => void;
};

const CustomerCreditPanel = ({ customer, creditRows, onPay }: Props) => {
  const creditUsedPct = customer?.creditLimit ? Math.round(((customer.creditUsed ?? 0) / customer.creditLimit) * 100) : 0;

  const columns: Column<CustomerCreditRow>[] = useMemo(() => [
    { key: 'customer', header: 'Cliente', accessor: 'customer' },
    { key: 'limit', header: 'Limite', accessor: (row) => formatCurrency(row.limit) },
    { key: 'used', header: 'Usado', accessor: (row) => formatCurrency(row.used) },
    { key: 'available', header: 'Disponible', accessor: (row) => formatCurrency(row.available) },
    { key: 'daysToDue', header: 'Dias', accessor: 'daysToDue' },
  ], []);

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

      <DataTable
        data={creditRows}
        columns={columns}
        keyField="customer"
        emptyMessage="No hay información de crédito"
        className="report-table"
      />
    </article>
  );
};

export default CustomerCreditPanel;
