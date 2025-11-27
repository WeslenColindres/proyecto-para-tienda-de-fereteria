import { useState } from 'react';
import Modal from '@/ui/molecules/Modal/Modal';
import { productsApi } from '@/shared/api/products';

interface ProductImportModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export const ProductImportModal = ({ onClose, onSuccess }: ProductImportModalProps) => {
    const [step, setStep] = useState<'upload' | 'preview'>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handlePreview = async () => {
        if (!file) return;
        setLoading(true);
        try {
            const data = await productsApi.previewImport(file);
            setPreviewData(data);
            setStep('preview');
        } catch (err) {
            alert('Error al generar la previsualización');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await productsApi.confirmImport(previewData);
            onSuccess();
            onClose();
        } catch (err) {
            alert('Error al importar productos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateRow = (index: number, field: string, value: any) => {
        const newData = [...previewData];
        newData[index] = { ...newData[index], [field]: value };
        setPreviewData(newData);
    };

    return (
        <Modal
            open={true}
            title={step === 'upload' ? "Importar Productos" : "Verificar Datos de Importación"}
            onClose={onClose}
        >
            {step === 'upload' ? (
                <div className="p-6 flex flex-col gap-6">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer relative">
                        <input
                            type="file"
                            accept=".csv,.xlsx"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="text-gray-500">
                            {file ? (
                                <div className="font-medium text-blue-600">{file.name}</div>
                            ) : (
                                <>
                                    <p className="text-lg mb-2">Arrastra tu archivo aquí o haz clic para seleccionar</p>
                                    <p className="text-sm">Soporta .csv y .xlsx</p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            onClick={onClose}
                        >
                            Cancelar
                        </button>
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handlePreview}
                            disabled={!file || loading}
                        >
                            {loading ? 'Procesando...' : 'Continuar'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col h-[80vh]">
                    <div className="p-4 bg-blue-50 text-blue-800 text-sm">
                        Verifica los datos antes de importar. Los productos existentes actualizarán su stock.
                    </div>

                    <div className="flex-1 overflow-auto p-4">
                        <table className="w-full text-sm border-collapse">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="p-2 text-left border-b font-semibold text-gray-600">Código</th>
                                    <th className="p-2 text-left border-b font-semibold text-gray-600">Nombre</th>
                                    <th className="p-2 text-left border-b font-semibold text-gray-600">Categoría</th>
                                    <th className="p-2 text-right border-b font-semibold text-gray-600">Stock Actual</th>
                                    <th className="p-2 text-right border-b font-semibold text-gray-600">A Ingresar</th>
                                    <th className="p-2 text-right border-b font-semibold text-gray-600">Total</th>
                                    <th className="p-2 text-center border-b font-semibold text-gray-600">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {previewData.map((row, i) => (
                                    <tr key={i} className={`border-b hover:bg-gray-50 ${row.isNew ? 'bg-green-50/30' : ''}`}>
                                        <td className="p-2 font-mono text-xs">{row.code}</td>
                                        <td className="p-2">
                                            <input
                                                value={row.name}
                                                onChange={e => updateRow(i, 'name', e.target.value)}
                                                className="w-full border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="p-2 text-gray-600">{row.category}</td>
                                        <td className="p-2 text-right text-gray-600">{row.currentStock}</td>
                                        <td className="p-2 text-right font-medium text-blue-600">+{row.stockToAdd}</td>
                                        <td className="p-2 text-right font-bold">{row.currentStock + row.stockToAdd}</td>
                                        <td className="p-2 text-center">
                                            {row.isNew ? (
                                                <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">Nuevo</span>
                                            ) : (
                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">Existente</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 border-t flex justify-between items-center bg-white">
                        <div className="text-sm text-gray-500">
                            {previewData.length} productos encontrados
                        </div>
                        <div className="flex gap-3">
                            <button
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                onClick={() => setStep('upload')}
                            >
                                Atrás
                            </button>
                            <button
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                onClick={handleConfirm}
                                disabled={loading}
                            >
                                {loading ? 'Importando...' : 'Confirmar Importación'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};
