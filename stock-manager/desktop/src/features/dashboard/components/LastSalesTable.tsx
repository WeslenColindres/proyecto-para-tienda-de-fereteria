import { useMemo } from 'react';
import type { DashboardData } from '@/shared/types/dashboard';
import { formatCurrency } from '@/shared/utils/format';
import { DataTable, type Column } from '@/ui/molecules/Table/DataTable';

type LastSalesTableProps = {
  sales: DashboardData['lastSales'];
};

const LastSalesTable = ({ sales }: LastSalesTableProps) => {
  const columns: Column<any>[] = useMemo(() => [
    { key: 'datetime', header: 'Fecha', accessor: 'datetime' },
    { key: 'customer', header: 'Cliente', accessor: 'customer' },
    { key: 'document', header: 'Documento', accessor: 'document' },
    { key: 'total', header: 'Total', accessor: (item) => formatCurrency(item.total), className: 'align-right' },
  ], []);

  const dataWithIds = useMemo(() => {
    return sales.map((s, i) => ({
      ...s,
      id: `${s.document}-${s.datetime}-${i}`
    }));
  }, [sales]);

  return (
    <article className="card">
      <header className="card-header" style={{ marginBottom: 10 }}>
        <h3 style={{ margin: 0 }}>Ultimas 10 ventas</h3>
      </header>
      <div className="data-table-wrapper">
        <DataTable
          data={dataWithIds}
          columns={columns}
          keyField="id"
          emptyMessage="No hay ventas recientes"
          className="table-sales"
        />
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
