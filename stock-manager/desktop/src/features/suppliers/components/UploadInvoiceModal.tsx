import { useState, useRef } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (file: File) => Promise<void>;
    title?: string;
}

export const UploadInvoiceModal = ({ isOpen, onClose, onSubmit, title = 'Subir Factura' }: Props) => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            // Validate file type
            if (!['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type)) {
                setError('Tipo de archivo no válido. Solo PDF, JPG, PNG, WEBP.');
                setFile(null);
                return;
            }
            // Validate size (e.g., 5MB)
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError('El archivo excede el tamaño máximo de 5MB.');
                setFile(null);
                return;
            }
            setFile(selectedFile);
            setError(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        try {
            await onSubmit(file);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Error al subir archivo');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <header className="modal-header">
                    <h3>{title}</h3>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </header>

                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg,.png,.webp"
                            style={{ display: 'none' }}
                        />
                        {file ? (
                            <div className="file-selected">
                                <span>📄 {file.name}</span>
                                <small>{(file.size / 1024 / 1024).toFixed(2)} MB</small>
                            </div>
                        ) : (
                            <div className="upload-placeholder">
                                <span>📂 Click para seleccionar archivo</span>
                                <small>PDF, JPG, PNG (Max 5MB)</small>
                            </div>
                        )}
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                        <button type="submit" className="btn-primary" disabled={loading || !file}>
                            {loading ? 'Subiendo...' : 'Subir'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
