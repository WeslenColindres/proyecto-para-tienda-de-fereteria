type SupplierTab = 'proveedores' | 'detalle' | 'compras' | 'analysis';

type SuppliersTabsProps = {
  activeTab: SupplierTab;
  onChange: (tab: SupplierTab) => void;
};

const SuppliersTabs = ({ activeTab, onChange }: SuppliersTabsProps) => {
  return (
    <div className="flex border-b border-gray-200 mb-6">
      <button
        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'proveedores'
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        onClick={() => onChange('proveedores')}
      >
        🏢 Catálogo
      </button>
      <button
        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'detalle'
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        onClick={() => onChange('detalle')}
      >
        📝 Detalle
      </button>
      <button
        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'compras'
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        onClick={() => onChange('compras')}
      >
        🛒 Compras
      </button>
      <button
        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'analysis'
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        onClick={() => onChange('analysis')}
      >
        📊 Análisis
      </button>
    </div>
  );
};

export type { SupplierTab };
export default SuppliersTabs;
