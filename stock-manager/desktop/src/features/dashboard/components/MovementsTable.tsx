import { useMemo } from 'react';
import type { DashboardData } from '@/shared/types/dashboard';
import { numberFormatter } from '@/shared/utils/format';
import { DataTable, type Column } from '@/ui/molecules/Table/DataTable';

type MovementsTableProps = {
  movements: DashboardData['movements'];
};

const MovementsTable = ({ movements }: MovementsTableProps) => {
  const columns: Column<any>[] = useMemo(() => [
    { key: 'product', header: 'Producto', accessor: 'product' },
    {
      key: 'type',
      header: 'Tipo',
      render: (movement) => {
        const typeLabel = movement.type === 'in' ? 'Entrada' : 'Salida';
        const pillClass = movement.type === 'in' ? 'status-pill up' : 'status-pill down';
        return <span className={pillClass}>{typeLabel}</span>;
      },
    },
    { key: 'qty', header: 'Cantidad', accessor: (item) => numberFormatter.format(item.qty) },
    { key: 'date', header: 'Fecha', accessor: 'date' },
  ], []);

  const dataWithIds = useMemo(() => {
    return movements.map((m, i) => ({
      ...m,
      id: `${m.product}-${m.date}-${i}`
    }));
  }, [movements]);

  return (
    <article className="card">
      <header className="card-header" style={{ marginBottom: 10 }}>
        <h3 style={{ margin: 0 }}>Ultimos movimientos</h3>
      </header>
      <div className="data-table-wrapper">
        <DataTable
          data={dataWithIds}
          columns={columns}
          keyField="id"
          emptyMessage="No hay movimientos recientes"
          className="table-movements"
        />
      </div>
      <div className="table-actions" style={{ textAlign: 'right', marginTop: 12 }}>
        <button
          className="link-button"
          data-action="movimientos"
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

export default MovementsTable;
