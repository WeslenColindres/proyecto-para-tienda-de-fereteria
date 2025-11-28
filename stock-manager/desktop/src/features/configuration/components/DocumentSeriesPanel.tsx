import { useState, useMemo } from 'react';
import { DataTable, type Column } from '@/ui/molecules/Table/DataTable';
import type { DocumentSeriesConfig } from '@/shared/types/configuration';
import { useConfiguration } from '../hooks/useConfiguration';
import Button from '@/ui/atoms/Button/Button';
import Card from '@/ui/atoms/Card/Card';

export const DocumentSeriesPanel = () => {
    const { documentSeries, loading } = useConfiguration();
    const [showAddModal, setShowAddModal] = useState(false);

    const columns: Column<DocumentSeriesConfig>[] = useMemo(() => [
        { key: 'documentType', header: 'Tipo', accessor: 'documentType', className: 'text-white font-medium' },
        { key: 'series', header: 'Serie', accessor: 'series', className: 'text-blue-400 font-mono' },
        {
            key: 'range',
            header: 'Rango',
            render: (series) => (
                <span className="text-gray-300 text-sm">
                    {series.startNumber} - {series.endNumber}
                </span>
            ),
        },
        { key: 'currentNumber', header: 'Actual', accessor: 'currentNumber', className: 'text-white font-bold' },
        {
            key: 'isActive',
            header: 'Estado',
            render: (series) => (
                <span className={`text-xs px-2 py-1 rounded-full ${series.isActive
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-gray-700 text-gray-400'
                    }`}>
                    {series.isActive ? 'Activa' : 'Inactiva'}
                </span>
            ),
        },
        {
            key: 'actions',
            header: 'Acciones',
            render: () => (
                <button className="text-blue-400 hover:text-blue-300 text-sm mr-3">Editar</button>
            ),
            className: 'text-right',
        },
    ], []);

    if (loading && !documentSeries.length) {
        return <div className="p-6 text-gray-400">Cargando series...</div>;
    }

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-white mb-1">Series de Documentos</h2>
                    <p className="text-sm text-gray-400">Gestión de series para facturación y otros documentos.</p>
                </div>
                <Button variant="primary" onClick={() => setShowAddModal(true)} className="text-sm">
                    + Nueva Serie
                </Button>
            </header>

            <Card className="p-0 overflow-hidden bg-gray-900/50 border-white/10">
                <div className="overflow-x-auto">
                    <DataTable
                        data={documentSeries}
                        columns={columns}
                        keyField="id"
                        emptyMessage="No hay series configuradas. Debes crear al menos una para facturar."
                        className="w-full text-left"
                        headerClassName="bg-black/20 text-gray-400 text-xs uppercase"
                        rowClassName="hover:bg-white/5 transition-colors"
                    />
                </div>
            </Card>

            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md p-6 bg-gray-900 border-white/20">
                        <h3 className="text-xl font-bold text-white mb-4">Nueva Serie</h3>
                        <p className="text-gray-400 mb-6">Funcionalidad en desarrollo...</p>
                        <div className="flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cerrar</Button>
                            <Button variant="primary" onClick={() => setShowAddModal(false)}>Guardar</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
