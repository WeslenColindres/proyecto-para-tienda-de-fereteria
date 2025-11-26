// src/features/dashboard/components/LowStockTable.tsx
import type { DashboardData } from '@/shared/types/dashboard';

type LowStockTableProps = {
  items: DashboardData['lowStock'];
};

const LowStockTable = ({ items }: LowStockTableProps) => {
  return (
    <article className="card">
      <header className="card-header" style={{ marginBottom: 10 }}>
        <h3 style={{ margin: 0 }}>Stock bajo</h3>
      </header>
      <div className="data-table-wrapper">
        <table className="table-stock" id="table-stock">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Stock</th>
              <th>Min</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.product}>
                <td>{row.product}</td>
                <td>{row.stock}</td>
                <td>{row.min}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-actions" style={{ textAlign: 'right', marginTop: 12 }}>
        <button
          className="link-button"
          data-action="stock"
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

export default LowStockTable;
