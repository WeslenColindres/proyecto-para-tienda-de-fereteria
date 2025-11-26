// src/features/dashboard/components/TopProductsCard.tsx
import type { DashboardData } from '@/shared/types/dashboard';
import { formatCurrency } from '@/shared/utils/format';

type TopProductsCardProps = {
  products: DashboardData['topProducts'];
};

const TopProductsCard = ({ products }: TopProductsCardProps) => {
  const maxAmount = Math.max(...products.map((p) => p.amount));

  return (
    <article className="card table-adapter">
      <header className="card-header" style={{ marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Top 5 productos</h3>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Hoy</span>
      </header>
      <div className="top-products-list" id="top-products">
        {products.map((product) => (
          <div className="product-row fade-in" key={product.name}>
            <header>
              <span>{product.name}</span>
              <span>{formatCurrency(product.amount)}</span>
            </header>
            <div className="product-bar">
              <span
                style={{
                  width: `${(product.amount / maxAmount) * 100}%`,
                }}
              ></span>
            </div>
            <small style={{ color: 'var(--text-muted)' }}>{product.units} unidades</small>
          </div>
        ))}
      </div>
    </article>
  );
};

export default TopProductsCard;
