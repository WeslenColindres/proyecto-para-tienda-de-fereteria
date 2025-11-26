// src/features/dashboard/components/MovementsTable.tsx
import type { DashboardData } from '@/shared/types/dashboard';
import { numberFormatter } from '@/shared/utils/format';

type MovementsTableProps = {
  movements: DashboardData['movements'];
};

const MovementsTable = ({ movements }: MovementsTableProps) => {
  return (
    <article className="card">
      <header className="card-header" style={{ marginBottom: 10 }}>
        <h3 style={{ margin: 0 }}>Ultimos movimientos</h3>
      </header>
      <div className="data-table-wrapper">
        <table className="table-movements" id="table-movements">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Tipo</th>
              <th>Cantidad</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((movement) => {
              const typeLabel = movement.type === 'in' ? 'Entrada' : 'Salida';
              const pillClass = movement.type === 'in' ? 'status-pill up' : 'status-pill down';

              return (
                <tr key={`${movement.product}-${movement.date}`}>
                  <td>{movement.product}</td>
                  <td>
                    <span className={pillClass}>{typeLabel}</span>
                  </td>
                  <td>{numberFormatter.format(movement.qty)}</td>
                  <td>{movement.date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
