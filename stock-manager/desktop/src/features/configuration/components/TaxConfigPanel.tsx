import { useState, useMemo } from 'react';
import { DataTable, type Column } from '@/ui/molecules/Table/DataTable';
import { useConfiguration } from '../hooks/useConfiguration';
import Button from '@/ui/atoms/Button/Button';
import Card from '@/ui/atoms/Card/Card';
import type { TaxConfig } from '@/shared/types/configuration';

export const TaxConfigPanel = () => {
    const { taxes, loading } = useConfiguration();
    const [showAddModal, setShowAddModal] = useState(false);

    const columns: Column<TaxConfig>[] = useMemo(() => [
        { key: 'name', header: 'Nombre', accessor: 'name', className: 'text-white font-medium' },
        { key: 'satCode', header: 'Código SAT', accessor: 'satCode', className: 'text-gray-300' },
        { key: 'percentage', header: 'Porcentaje', accessor: (tax) => `${tax.percentage}%`, className: 'text-white' },
        {
            key: 'type',
            header: 'Tipo',
            render: (tax) => (
                <span className={`text-xs px-2 py-1 rounded border ${tax.type === 'INCLUDED'
                    ? 'border-blue-500/30 text-blue-400 bg-blue-500/10'
                    : 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10'
                    }`}>
                    {tax.type === 'INCLUDED' ? 'Incluido' : 'Agregado'}
                </span>
            ),
        },
        {
            key: 'isActive',
            header: 'Estado',
            render: (tax) => (
                <span className={`text-xs px-2 py-1 rounded-full ${tax.isActive
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-gray-700 text-gray-400'
                    }`}>
                    {tax.isActive ? 'Activo' : 'Inactivo'}
                </span>
            ),
        },
        {
            key: 'actions',
            header: 'Acciones',
            render: () => (
                <button className="text-blue-400 hover:text-blue-300 mr-3">Editar</button>
            ),
            className: 'text-right',
        },
    ], []);

    if (loading && !taxes.length) {
        return <div className="p-6 text-gray-400">Cargando impuestos...</div>;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <header className="mb-6 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Impuestos y Moneda</h2>
                    <p className="text-gray-400">Configuración de tasas impositivas y moneda base.</p>
                </div>
                <Button variant="primary" onClick={() => setShowAddModal(true)}>+ Nuevo Impuesto</Button>
            </header>

            <div className="space-y-6">
                <Card className="p-6 bg-gray-900/50 border-white/10">
                    <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-4 mb-4">Moneda Base</h3>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                            <span className="text-2xl font-bold text-blue-400">GTQ</span>
                        </div>
                        <div>
                            <div className="font-medium text-white">Quetzal Guatemalteco</div>
                            <div className="text-sm text-gray-400">Moneda principal del sistema</div>
                        </div>
                        <div className="ml-auto">
                            <Button variant="ghost" className="text-sm">Cambiar</Button>
                        </div>
                    </div>
                </Card>

                <Card className="p-0 overflow-hidden bg-gray-900/50 border-white/10">
                    <div className="p-6 border-b border-white/10">
                        <h3 className="text-lg font-semibold text-white">Impuestos Configurados</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <DataTable
                            data={taxes}
                            columns={columns}
                            keyField="id"
                            emptyMessage="No hay impuestos configurados"
                            className="w-full text-left"
                            headerClassName="bg-black/20 text-gray-400 text-sm uppercase"
                            rowClassName="hover:bg-white/5 transition-colors"
                        />
                    </div>
                </Card>
            </div>

            {/* TODO: Implement Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md p-6 bg-gray-900 border-white/20">
                        <h3 className="text-xl font-bold text-white mb-4">Nuevo Impuesto</h3>
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
