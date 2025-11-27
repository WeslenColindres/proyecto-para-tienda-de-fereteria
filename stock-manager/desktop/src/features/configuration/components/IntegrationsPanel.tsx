import { useState } from 'react';
import { FelConfigPanel } from './FelConfigPanel';
import { DocumentSeriesPanel } from './DocumentSeriesPanel';

export const IntegrationsPanel = () => {
    const [activeTab, setActiveTab] = useState<'fel' | 'series' | 'webhooks'>('fel');

    return (
        <div className="flex flex-col h-full">
            <div className="px-6 pt-6 pb-0 border-b border-white/10">
                <div className="flex gap-6">
                    <button
                        className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'fel'
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-gray-400 hover:text-gray-200'
                            }`}
                        onClick={() => setActiveTab('fel')}
                    >
                        Facturación FEL
                    </button>
                    <button
                        className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'series'
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-gray-400 hover:text-gray-200'
                            }`}
                        onClick={() => setActiveTab('series')}
                    >
                        Series de Documentos
                    </button>
                    <button
                        className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'webhooks'
                                ? 'border-blue-500 text-blue-400'
                                : 'border-transparent text-gray-400 hover:text-gray-200'
                            }`}
                        onClick={() => setActiveTab('webhooks')}
                    >
                        Webhooks y API
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto bg-gray-900/30">
                {activeTab === 'fel' && <FelConfigPanel />}

                {activeTab === 'series' && (
                    <div className="p-6 max-w-4xl mx-auto">
                        <DocumentSeriesPanel />
                    </div>
                )}

                {activeTab === 'webhooks' && (
                    <div className="p-6 max-w-4xl mx-auto text-center py-12">
                        <div className="text-4xl mb-4">🔌</div>
                        <h3 className="text-xl font-bold text-white mb-2">Integraciones Externas</h3>
                        <p className="text-gray-400 max-w-md mx-auto">
                            Configura webhooks para notificar a sistemas externos sobre eventos de ventas, inventario y más.
                        </p>
                        <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg inline-block text-yellow-200 text-sm">
                            🚧 Módulo en construcción
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
