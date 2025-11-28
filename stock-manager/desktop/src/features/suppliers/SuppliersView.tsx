import SuppliersPage from './components/SuppliersPage';
import SuppliersOrdersPage from './components/SuppliersOrdersPage';
import { SuppliersPayablesPage } from './components/SuppliersPayablesPage';
import { SuppliersAnalysisPage } from './components/SuppliersAnalysisPage';

type SuppliersViewProps = {
  activeItem: string;
};

const resolvePage = (activeItem: string): 'catalog' | 'orders' | 'payables' | 'analysis' => {
  if (activeItem === 'proveedores-ordenes') return 'orders';
  if (activeItem === 'proveedores-cxp') return 'payables';
  if (activeItem === 'proveedores-analisis') return 'analysis';
  return 'catalog';
};

const SuppliersView = ({ activeItem }: SuppliersViewProps) => {
  const page = resolvePage(activeItem);

  if (page === 'orders') return <SuppliersOrdersPage />;
  if (page === 'payables') return <SuppliersPayablesPage />;
  if (page === 'analysis') return <SuppliersAnalysisPage />;
  return <SuppliersPage activeItem={activeItem} />;
};

export default SuppliersView;
