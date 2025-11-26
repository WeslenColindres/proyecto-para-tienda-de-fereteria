// src/features/dashboard/components/UpdateStatusCard.tsx
type UpdateStatusCardProps = {
  updateLog: string[];
  onCheckUpdates?: () => void;
};

const UpdateStatusCard = ({ updateLog, onCheckUpdates }: UpdateStatusCardProps) => {
  return (
    <>
      <header className="card-header" style={{ marginBottom: 12 }}>
        <div>
          <h3 style={{ margin: 0 }}>Estado de auto-actualizacion</h3>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
            Registro de eventos recientes del updater
          </p>
        </div>
        <button className="btn-outline" onClick={onCheckUpdates}>
          Buscar actualizaciones
        </button>
      </header>
      <div
        id="update-log"
        style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: 12 }}
      >
        {updateLog.map((line, idx) => (
          <div key={`${line}-${idx}`}>{line}</div>
        ))}
      </div>
    </>
  );
};

export default UpdateStatusCard;
