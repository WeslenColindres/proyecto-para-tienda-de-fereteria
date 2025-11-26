type SupplierTab = 'proveedores' | 'detalle' | 'compras';

type SuppliersTabsProps = {
  activeTab: SupplierTab;
  onChange: (tab: SupplierTab) => void;
};

const SuppliersTabs = ({ activeTab, onChange }: SuppliersTabsProps) => {
  return (
    <div className="suppliers-tabs">
      <button className={activeTab === 'proveedores' ? 'active' : ''} onClick={() => onChange('proveedores')}>
        Proveedores
      </button>
      <button className={activeTab === 'detalle' ? 'active' : ''} onClick={() => onChange('detalle')}>
        Detalle
      </button>
      <button className={activeTab === 'compras' ? 'active' : ''} onClick={() => onChange('compras')}>
        Compras
      </button>
    </div>
  );
};

export type { SupplierTab };
export default SuppliersTabs;
