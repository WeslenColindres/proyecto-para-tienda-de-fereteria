// src/features/dashboard/components/LastSalesTable.tsx
import type { DashboardData } from '@/shared/types/dashboard';
import { formatCurrency } from '@/shared/utils/format';

type LastSalesTableProps = {
  sales: DashboardData['lastSales'];
};

const LastSalesTable = ({ sales }: LastSalesTableProps) => {
  return (
    <article className="card">
      <header className="card-header" style={{ marginBottom: 10 }}>
        <h3 style={{ margin: 0 }}>Ultimas 10 ventas</h3>
      </header>
      <div className="data-table-wrapper">
        <table className="table-sales" id="table-sales">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Documento</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={`${sale.document}-${sale.datetime}`}>
                <td>{sale.datetime}</td>
                <td>{sale.customer}</td>
                <td>{sale.document}</td>
                <td className="align-right">{formatCurrency(sale.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-actions" style={{ textAlign: 'right', marginTop: 12 }}>
        <button
          className="link-button"
          data-action="ventas"
          style={{
            border: 'none',
            background: 'none',
            color: '#3498db',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Ver todo
        </button>
      </div>
    </article>
  );
};

export default LastSalesTable;
