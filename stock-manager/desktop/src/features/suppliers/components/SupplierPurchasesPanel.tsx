import { formatCurrency } from '@/shared/utils/format';
import type { SupplierPurchaseRow } from '@/shared/types/suppliers';

type SupplierPurchasesPanelProps = {
  purchases: SupplierPurchaseRow[];
  onReport: () => void;
};

const SupplierPurchasesPanel = ({ purchases, onReport }: SupplierPurchasesPanelProps) => {
  return (
    <article className="purchase-card">
      <header className="card-header">
        <h3 style={{ margin: 0 }}>Record de compras rapido</h3>
        <button className="supplier-btn" onClick={onReport}>
          📈 Reporte
        </button>
      </header>
      <ul>
        {purchases.map((row) => (
          <li key={row.id} className="purchase-row">
            <div>
              <strong>{row.date}</strong> {row.documentNumber}
              <div className="purchase-meta">Ultimas compras</div>
            </div>
            <div className="balance">{formatCurrency(row.amount)}</div>
            <span className={`purchase-status ${row.status}`}>{row.status}</span>
          </li>
        ))}
        {!purchases.length && <li className="purchase-row muted">Sin compras recientes</li>}
      </ul>
    </article>
  );
};

export default SupplierPurchasesPanel;
