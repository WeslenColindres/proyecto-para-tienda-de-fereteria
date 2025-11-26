type SupplierActionsCellProps = {
  onEdit: () => void;
  onCall?: () => void;
  onEmail?: () => void;
  onChat?: () => void;
};

const SupplierActionsCell = ({ onEdit, onCall, onEmail, onChat }: SupplierActionsCellProps) => {
  return (
    <div className="supplier-actions">
      <button type="button" title="Llamar" onClick={(e) => { e.stopPropagation(); onCall?.(); }}>
        📞
      </button>
      <button type="button" title="Email" onClick={(e) => { e.stopPropagation(); onEmail?.(); }}>
        📧
      </button>
      <button type="button" title="WhatsApp" onClick={(e) => { e.stopPropagation(); onChat?.(); }}>
        📝
      </button>
      <button type="button" title="Editar" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
        ✏️
      </button>
    </div>
  );
};

export default SupplierActionsCell;
