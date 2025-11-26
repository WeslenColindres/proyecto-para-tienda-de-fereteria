type SupplierActionsCellProps = {
  onEdit: () => void;
  onDelete: () => void;
  onCall?: () => void;
  onEmail?: () => void;
  onChat?: () => void;
};

const SupplierActionsCell = ({ onEdit, onDelete, onCall, onEmail, onChat }: SupplierActionsCellProps) => {
  return (
    <div className="supplier-actions">
      <button type="button" className="btn-icon" title="Llamar" onClick={(e) => { e.stopPropagation(); onCall?.(); }}>
        📞
      </button>
      <button type="button" className="btn-icon" title="Email" onClick={(e) => { e.stopPropagation(); onEmail?.(); }}>
        📧
      </button>
      <button type="button" className="btn-icon" title="WhatsApp" onClick={(e) => { e.stopPropagation(); onChat?.(); }}>
        📝
      </button>
      <button type="button" className="btn-icon primary" title="Editar" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
        ✏️
      </button>
      <button type="button" className="btn-icon danger" title="Eliminar" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
        🗑️
      </button>
    </div>
  );
};

export default SupplierActionsCell;
