import { Button } from '@/ui/atoms/Button';
import { Card } from '@/ui/atoms/Card';
import { Pill } from '@/ui/atoms/Pill';
import './LowStockList.css';

const items = [
  { name: 'Tornillo drywall 1" caja 200u', category: 'Fijación', sku: 'SKU-2024', status: 'Crítico' },
  { name: 'Soldadura estaño 500g', category: 'Soldadura', sku: 'SKU-0088', status: 'Bajo' },
  { name: 'Broca concreto 1/2"', category: 'Brocas', sku: 'SKU-0441', status: 'Bajo' },
  { name: 'Cinta masking 2"', category: 'Pintura', sku: 'SKU-0761', status: 'Crítico' }
];

const LowStockList = () => {
  return (
    <Card title="Reposiciones urgentes">
      <div className="list">
        {items.map((item) => (
          <div className="row" key={item.sku}>
            <div>
              <p className="name">{item.name}</p>
              <p className="meta">
                {item.category} · {item.sku}
              </p>
            </div>
            <div className="actions">
              <Pill tone={item.status === 'Crítico' ? 'warn' : 'good'}>{item.status}</Pill>
              <Button size="sm" variant="ghost">
                Reordenar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default LowStockList;
