import SuppliersPage from './components/SuppliersPage';
import SuppliersOrdersPage from './components/SuppliersOrdersPage';
import { SuppliersPayablesPage } from './components/SuppliersPayablesPage';

type SuppliersViewProps = {
  activeItem: string;
};

const resolvePage = (activeItem: string): 'catalog' | 'orders' | 'payables' => {
  if (activeItem === 'proveedores-ordenes') return 'orders';
  if (activeItem === 'proveedores-cxp') return 'payables';
  return 'catalog';
};

const SuppliersView = ({ activeItem }: SuppliersViewProps) => {
  const page = resolvePage(activeItem);

  if (page === 'orders') return <SuppliersOrdersPage />;
  if (page === 'payables') return <SuppliersPayablesPage />;
  return <SuppliersPage activeItem={activeItem} />;
};

export default SuppliersView;
