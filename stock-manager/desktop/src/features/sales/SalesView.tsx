import { cn } from '@/shared/utils/cn';
import SalesPOS from './components/SalesPOS';
import InvoiceList from './components/InvoiceList';
import ReceiptList from './components/ReceiptList';
import ReturnsList from './components/ReturnsList';

type SalesViewProps = {
  activeItem: string;
};

const SalesView = ({ activeItem }: SalesViewProps) => {
  const renderContent = () => {
    switch (activeItem) {
      case 'ventas-pdv':
        return <SalesPOS />;
      case 'ventas-facturas':
        return <InvoiceList />;
      case 'ventas-comprobantes':
        return <ReceiptList />;
      case 'ventas-devoluciones':
        return <ReturnsList />;
      default:
        return <SalesPOS />;
    }
  };

  return (
    <main className={cn('app-view is-visible', 'flex flex-col gap-4 px-4 pb-6 pt-4 lg:px-6')} id="sales-view" data-app-view>
      {renderContent()}
    </main>
  );
};

export default SalesView;
