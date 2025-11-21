import { KpiCard } from '@/ui/molecules/KpiCard';
import './InventorySnapshot.css';

const InventorySnapshot = () => {
  return (
    <div className="snapshot-grid">
      <KpiCard
        label="Stock disponible"
        value="4,126 u."
        hint="Almacenes y bodegas centralizadas"
        trend={{ value: '+8% vs. semana', tone: 'good' }}
      />
      <KpiCard label="Órdenes pendientes" value="18" hint="Compras en tránsito con fecha estimada" />
      <KpiCard
        label="Puntos críticos"
        value="6 líneas"
        hint="Prioriza reabastecer tornillos y adhesivos"
        trend={{ value: 'Atender hoy', tone: 'warn' }}
      />
    </div>
  );
};

export default InventorySnapshot;
