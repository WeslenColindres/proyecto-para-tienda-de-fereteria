import ClientsCatalogView from './views/ClientsCatalogView';
import ClientHistoryView from './views/ClientHistoryView';
import ClientAccountsReceivableView from './views/ClientAccountsReceivableView';

type CustomersViewProps = {
  activeItem: 'clientes-catalogo' | 'clientes-historial' | 'clientes-cxc';
};

const CustomersView = ({ activeItem }: CustomersViewProps) => {
  return (
    <main className="customers-view app-view is-visible" id="customers-view" data-app-view>
      {activeItem === 'clientes-catalogo' && <ClientsCatalogView />}
      {activeItem === 'clientes-historial' && <ClientHistoryView />}
      {activeItem === 'clientes-cxc' && <ClientAccountsReceivableView />}
    </main>
  );
};

export default CustomersView;
