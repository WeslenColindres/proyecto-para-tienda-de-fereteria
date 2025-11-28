type SupplierActionsCellProps = {
  onEdit: () => void;
  onDelete: () => void;
  onCall?: () => void;
  onEmail?: () => void;
  onChat?: () => void;
};

const SupplierActionsCell = ({ onEdit, onDelete, onCall, onEmail, onChat }: SupplierActionsCellProps) => {
  return (
    <div className="flex items-center justify-center gap-1">
      <button
        type="button"
        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
        title="Llamar"
        onClick={(e) => { e.stopPropagation(); onCall?.(); }}
      >
        📞
      </button>
      <button
        type="button"
        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
        title="Email"
        onClick={(e) => { e.stopPropagation(); onEmail?.(); }}
      >
        📧
      </button>
      <button
        type="button"
        className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
        title="WhatsApp"
        onClick={(e) => { e.stopPropagation(); onChat?.(); }}
      >
        📝
      </button>
      <button
        type="button"
        className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
        title="Editar"
        onClick={(e) => { e.stopPropagation(); onEdit(); }}
      >
        ✏️
      </button>
      <button
        type="button"
        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
        title="Eliminar"
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
      >
        🗑️
      </button>
    </div>
  );
};

export default SupplierActionsCell;
