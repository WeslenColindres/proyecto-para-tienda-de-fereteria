import { Card } from '@/ui/atoms/Card';
import './RecentMovements.css';

const movements = [
  { name: 'Ferretería La Central', description: 'Venta mostrador · Factura 1032', qty: '-34 u' },
  { name: 'Proveedor AceroMax', description: 'Compra programada · OC-558', qty: '+180 u' },
  { name: 'Sucursal Norte', description: 'Traspaso interno', qty: '-22 u' }
];

const RecentMovements = () => {
  return (
    <Card title="Movimientos recientes">
      <div className="movements">
        {movements.map((movement) => (
          <div className="movement" key={movement.name}>
            <div>
              <p className="name">{movement.name}</p>
              <p className="description">{movement.description}</p>
            </div>
            <span className="qty">{movement.qty}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RecentMovements;
