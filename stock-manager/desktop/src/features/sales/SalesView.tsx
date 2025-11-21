import SalesList from './components/SalesList';
import SalesPOS from './components/SalesPOS';

type SalesViewProps = {
  activeItem: string;
};

const SalesView = ({ activeItem }: SalesViewProps) => {
  const viewMode = activeItem === 'ventas-pdv' ? 'pdv' : activeItem === 'ventas-devoluciones' ? 'devoluciones' : 'listado';

  return (
    <main className="sales-view app-view is-visible" id="sales-view" data-app-view>
      {viewMode === 'pdv' ? <SalesPOS /> : <SalesList variant={viewMode} />}
    </main>
  );
};

export default SalesView;
