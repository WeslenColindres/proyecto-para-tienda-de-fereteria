import { useState, useEffect, useMemo } from 'react';
import { DataTable, type Column } from '@/ui/molecules/Table/DataTable';
import { customersApi } from '@/shared/api/customers';
import { formatCurrency, formatDate } from '@/shared/utils/format';
import type { CustomerItem } from '@/shared/types/customers';

const ClientHistoryView = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<CustomerItem[]>([]);
    const [selectedClient, setSelectedClient] = useState<CustomerItem | null>(null);
    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const pageSize = 10;

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

    // Fetch sales when client is selected
    useEffect(() => {
        if (!selectedClient) return;

        const fetchSales = async () => {
            setLoading(true);
            try {
                const res = await customersApi.getSales(selectedClient.id, { page, pageSize });
                setSales(res.data);
                setTotal(res.total);
            } catch (error) {
                console.error('Error fetching sales:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSales();
        fetchSales();
    }, [selectedClient, page]);

    const columns: Column<any>[] = useMemo(() => [
        { key: 'date', header: 'Fecha', accessor: (sale) => formatDate(sale.date) },
        { key: 'documentNumber', header: 'Documento', accessor: 'documentNumber', className: 'font-mono' },
        {
            key: 'status',
            header: 'Estado',
            render: (sale) => (
                <span className={`px-2 py-1 rounded text-xs ${sale.status === 'pagado' ? 'bg-green-500/20 text-green-400' :
                    sale.status === 'anulado' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                    }`}>
                    {sale.status}
                </span>
            ),
        },
        { key: 'total', header: 'Total', accessor: (sale) => formatCurrency(sale.total), className: 'text-right font-mono' },
        {
            key: 'actions',
            header: 'Acciones',
            render: () => (
                <button className="text-blue-400 hover:text-blue-300 text-sm">Ver Detalle</button>
            ),
            className: 'text-center',
        },
    ], []);

    return (
        <div className="client-history-view h-full flex flex-col gap-4">
            <header className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Historial de Compras</h2>
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
                                        setPage(1);
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
                                setSales([]);
                                setSearchTerm('');
                            }}
                        >
                            Cambiar
                        </button>
                    </div>
                )}
            </section>

            {selectedClient && (
                <section className="sales-list flex-1 overflow-auto bg-white/5 rounded-lg border border-white/10">
                    <DataTable
                        data={sales}
                        columns={columns}
                        keyField="id"
                        loading={loading}
                        emptyMessage="No hay compras registradas"
                        className="w-full text-left border-collapse"
                        headerClassName="bg-white/5 sticky top-0"
                        rowClassName="border-b border-white/5 hover:bg-white/5"
                    />
                </section>
            )}

            {selectedClient && total > pageSize && (
                <footer className="flex justify-between items-center p-2 text-sm text-muted">
                    <div>Pagina {page} de {Math.ceil(total / pageSize)}</div>
                    <div className="flex gap-2">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1 bg-white/5 rounded hover:bg-white/10 disabled:opacity-50"
                        >
                            Anterior
                        </button>
                        <button
                            disabled={page >= Math.ceil(total / pageSize)}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 bg-white/5 rounded hover:bg-white/10 disabled:opacity-50"
                        >
                            Siguiente
                        </button>
                    </div>
                </footer>
            )}
        </div>
    );
};

export default ClientHistoryView;
