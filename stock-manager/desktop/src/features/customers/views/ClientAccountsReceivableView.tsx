import { useState, useEffect } from 'react';
import { customersApi } from '@/shared/api/customers';
import { formatCurrency } from '@/shared/utils/format';
import type { CustomerItem } from '@/shared/types/customers';

const ClientAccountsReceivableView = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<CustomerItem[]>([]);
    const [selectedClient, setSelectedClient] = useState<CustomerItem | null>(null);
    const [creditInfo, setCreditInfo] = useState<{ limit: number; used: number; available: number } | null>(null);
    const [loading, setLoading] = useState(false);

    // Search clients
    useEffect(() => {
        const search = async () => {
            if (searchTerm.length < 2) {
                setSearchResults([]);
                return;
            }
            try {
                const res = await customersApi.list({ q: searchTerm, pageSize: 5 });
                setSearchResults(res.data);
            } catch (error) {
                console.error('Error searching clients:', error);
            }
        };

        const timer = setTimeout(search, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch credit info when client is selected
    useEffect(() => {
        if (!selectedClient) return;

        const fetchCredit = async () => {
            setLoading(true);
            try {
                const res = await customersApi.getCredit(selectedClient.id);
                setCreditInfo(res);
            } catch (error) {
                console.error('Error fetching credit info:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCredit();
    }, [selectedClient]);

    return (
        <div className="client-cxc-view h-full flex flex-col gap-4">
            <header className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Cuentas por Cobrar</h2>
            </header>

            <section className="search-section bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="relative">
                    <label className="block text-sm text-muted mb-1">Buscar Cliente</label>
                    <input
                        type="search"
                        placeholder="Nombre, NIT..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 bg-black/20 border border-white/10 rounded focus:border-blue-500 outline-none"
                    />

                    {searchResults.length > 0 && !selectedClient && (
                        <div className="absolute top-full left-0 right-0 bg-gray-900 border border-white/10 rounded-b-lg z-10 max-h-60 overflow-y-auto shadow-xl">
                            {searchResults.map(client => (
                                <div
                                    key={client.id}
                                    className="p-3 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-0"
                                    onClick={() => {
                                        setSelectedClient(client);
                                        setSearchTerm(client.name);
                                        setSearchResults([]);
                                    }}
                                >
                                    <div className="font-medium">{client.name}</div>
                                    <div className="text-xs text-muted">NIT: {client.nit} | {client.city}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {selectedClient && (
                    <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded flex justify-between items-center">
                        <div>
                            <div className="font-bold text-blue-400">{selectedClient.name}</div>
                            <div className="text-sm text-muted">NIT: {selectedClient.nit}</div>
                        </div>
                        <button
                            className="text-sm text-white/50 hover:text-white"
                            onClick={() => {
                                setSelectedClient(null);
                                setCreditInfo(null);
                                setSearchTerm('');
                            }}
                        >
                            Cambiar
                        </button>
                    </div>
                )}
            </section>

            {selectedClient && creditInfo && (
                <section className="credit-info grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="card bg-white/5 p-4 rounded-lg border border-white/10">
                        <div className="text-sm text-muted">Limite de Credito</div>
                        <div className="text-2xl font-bold text-white">{formatCurrency(creditInfo.limit)}</div>
                    </div>
                    <div className="card bg-white/5 p-4 rounded-lg border border-white/10">
                        <div className="text-sm text-muted">Credito Utilizado</div>
                        <div className="text-2xl font-bold text-yellow-400">{formatCurrency(creditInfo.used)}</div>
                    </div>
                    <div className="card bg-white/5 p-4 rounded-lg border border-white/10">
                        <div className="text-sm text-muted">Disponible</div>
                        <div className="text-2xl font-bold text-green-400">{formatCurrency(creditInfo.available)}</div>
                    </div>
                </section>
            )}

            {selectedClient && (
                <section className="flex-1 bg-white/5 rounded-lg border border-white/10 p-4 flex items-center justify-center text-muted">
                    <p>Seleccione una factura pendiente para registrar pago (Proximamente)</p>
                </section>
            )}
        </div>
    );
};

export default ClientAccountsReceivableView;
