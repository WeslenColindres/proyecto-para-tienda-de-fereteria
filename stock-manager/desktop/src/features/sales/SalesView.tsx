import { cn } from '@/shared/utils/cn';
import SalesList from './components/SalesList';
import SalesPOS from './components/SalesPOS';

type SalesViewProps = {
  activeItem: string;
};

const SalesView = ({ activeItem }: SalesViewProps) => {
  const viewMode: 'pdv' | 'facturas' | 'devoluciones' =
    activeItem === 'ventas-pdv' ? 'pdv' : activeItem === 'ventas-devoluciones' ? 'devoluciones' : 'facturas';

  return (
    <main className={cn('app-view is-visible', 'flex flex-col gap-4 px-4 pb-6 pt-4 lg:px-6')} id="sales-view" data-app-view>
      {viewMode === 'pdv' ? <SalesPOS /> : <SalesList variant={viewMode} />}
    </main>
  );
};

export default SalesView;
