import { useState, useMemo } from 'react';
import { DataTable, type Column } from '@/ui/molecules/Table/DataTable';
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

    const columns: Column<any>[] = useMemo(() => [
        {
            key: 'code',
            header: 'Código',
            render: (row) => (
                <div className="flex items-center gap-2">
                    {row.errors && row.errors.length > 0 && (
                        <div className="group relative">
                            <div className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold cursor-help">!</div>
                            <div className="absolute left-full top-0 ml-2 w-48 p-2 bg-red-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                                <ul className="list-disc pl-3">
                                    {row.errors.map((err: string, idx: number) => (
                                        <li key={idx}>{err}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                    {row.code}
                </div>
            ),
            className: 'font-mono text-xs',
        },
        {
            key: 'name',
            header: 'Nombre',
            render: (row) => {
                // We need the index to update. DataTable doesn't pass index to render directly in Column type usually, 
                // but we can find index in data or pass it if we modify data.
                // Or we can rely on row reference if it's stable? No, we need index for updateRow.
                // Let's assume row has an ID or we add one.
                // If not, we can use `previewData.indexOf(row)`.
                const index = previewData.indexOf(row);
                return (
                    <input
                        value={row.name}
                        onChange={e => updateRow(index, 'name', e.target.value)}
                        className={`w-full border rounded text-sm focus:ring-1 focus:ring-blue-500 ${!row.name ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                    />
                );
            },
        },
        { key: 'category', header: 'Categoría', accessor: 'category', className: 'text-gray-600' },
        { key: 'currentStock', header: 'Stock Actual', accessor: 'currentStock', className: 'text-right text-gray-600' },
        { key: 'stockToAdd', header: 'A Ingresar', accessor: (row) => `+${row.stockToAdd}`, className: 'text-right font-medium text-blue-600' },
        { key: 'total', header: 'Total', accessor: (row) => row.currentStock + row.stockToAdd, className: 'text-right font-bold' },
        {
            key: 'status',
            header: 'Estado',
            render: (row) => (
                row.isNew ? (
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">Nuevo</span>
                ) : (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">Existente</span>
                )
            ),
            className: 'text-center',
        },
    ], [previewData]);

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
                        <DataTable
                            data={previewData.map((row, i) => ({ ...row, id: i }))} // Add ID for keyField
                            columns={columns}
                            keyField="id"
                            className="w-full text-sm border-collapse"
                            headerClassName="bg-gray-50 sticky top-0 z-10"
                            rowClassName="border-b hover:bg-gray-50"
                        />
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
