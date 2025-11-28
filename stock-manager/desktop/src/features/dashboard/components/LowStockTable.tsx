// src/features/dashboard/components/LowStockTable.tsx
import { useMemo } from 'react';
import type { DashboardData } from '@/shared/types/dashboard';
import { DataTable, type Column } from '@/ui/molecules/Table/DataTable';

type LowStockTableProps = {
  items: DashboardData['lowStock'];
};

const LowStockTable = ({ items }: LowStockTableProps) => {
  const columns: Column<any>[] = useMemo(() => [
    { key: 'product', header: 'Producto', accessor: 'product' },
    { key: 'stock', header: 'Stock', accessor: 'stock' },
    { key: 'min', header: 'Min', accessor: 'min' },
  ], []);

  return (
    <article className="card">
      <header className="card-header" style={{ marginBottom: 10 }}>
        <h3 style={{ margin: 0 }}>Stock bajo</h3>
      </header>
      <div className="data-table-wrapper">
        <DataTable
          data={items}
          columns={columns}
          keyField="product"
          emptyMessage="No hay productos con stock bajo"
          className="table-stock"
        />
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
