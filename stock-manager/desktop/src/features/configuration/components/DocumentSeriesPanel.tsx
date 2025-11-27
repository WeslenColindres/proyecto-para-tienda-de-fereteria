import { useState } from 'react';
import { useConfiguration } from '../hooks/useConfiguration';
import Button from '@/ui/atoms/Button/Button';
import Card from '@/ui/atoms/Card/Card';

export const DocumentSeriesPanel = () => {
    const { documentSeries, loading } = useConfiguration();
    const [showAddModal, setShowAddModal] = useState(false);

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
                    <table className="w-full text-left">
                        <thead className="bg-black/20 text-gray-400 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-3 font-medium">Tipo</th>
                                <th className="px-6 py-3 font-medium">Serie</th>
                                <th className="px-6 py-3 font-medium">Rango</th>
                                <th className="px-6 py-3 font-medium">Actual</th>
                                <th className="px-6 py-3 font-medium">Estado</th>
                                <th className="px-6 py-3 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {documentSeries.map((series) => (
                                <tr key={series.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-white font-medium">{series.documentType}</td>
                                    <td className="px-6 py-4 text-blue-400 font-mono">{series.series}</td>
                                    <td className="px-6 py-4 text-gray-300 text-sm">
                                        {series.startNumber} - {series.endNumber}
                                    </td>
                                    <td className="px-6 py-4 text-white font-bold">{series.currentNumber}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs px-2 py-1 rounded-full ${series.isActive
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-gray-700 text-gray-400'
                                            }`}>
                                            {series.isActive ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-blue-400 hover:text-blue-300 text-sm mr-3">Editar</button>
                                    </td>
                                </tr>
                            ))}
                            {documentSeries.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No hay series configuradas. Debes crear al menos una para facturar.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
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
