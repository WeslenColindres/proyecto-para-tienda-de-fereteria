import { useMemo, useState } from 'react';
import { useSalesChunks } from '@/shared/hooks/useSalesChunks';
import type { SaleStatus } from '@/shared/types/sales';
import { cn } from '@/shared/utils/cn';
import SaleReportModal from './SaleReportModal';

const formatMoney = (value: number) =>
    value.toLocaleString('es-GT', { style: 'currency', currency: 'GTQ', minimumFractionDigits: 2, maximumFractionDigits: 2 });

const panelBase =
    'rounded-3xl border border-white/10 bg-gradient-to-br from-rose-950/20 to-[#020408] shadow-lg';
const inputBase =
    'h-11 rounded-2xl border border-white/10 bg-white/5 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-rose-400 focus:outline-none focus:ring-0';

const ReturnsList = () => {
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [query, setQuery] = useState('');
    const [selectedSale, setSelectedSale] = useState<string | null>(null);

    const filters = useMemo(
        () => ({
            returnsOnly: true,
            search: query || undefined,
            from: fromDate || undefined,
            to: toDate || undefined,
            pageSize: 12,
        }),
        [fromDate, query, toDate],
    );

    const { data, loading, page, pageSize, total, setPage, hasNext, hasPrev, reload } = useSalesChunks(filters);

    return (
        <section className="flex flex-col gap-6 text-slate-100" data-tailwind-view="returns-list">
            <div className="flex flex-col gap-2">
                <h3 className="text-3xl font-bold text-white">Devoluciones</h3>
                <p className="text-slate-400">Historial de devoluciones y notas de crédito.</p>
            </div>

            <div className={cn(panelBase, 'p-6')}>
                <div className="grid gap-4 md:grid-cols-3">
                    <input
                        type="text"
                        placeholder="Buscar devolución..."
                        className={inputBase}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="flex gap-2">
                        <input type="date" className={cn(inputBase, 'w-full')} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                        <input type="date" className={cn(inputBase, 'w-full')} value={toDate} onChange={(e) => setToDate(e.target.value)} />
                    </div>
                    <button
                        type="button"
                        className="h-11 rounded-2xl bg-rose-600 font-bold text-white hover:bg-rose-500 transition-colors"
                        onClick={() => reload()}
                    >
                        Buscar Devoluciones
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {data.map((sale) => (
                    <div key={sale.id} className={cn(panelBase, 'p-6 flex flex-col md:flex-row gap-6 items-center hover:border-rose-500/30 transition-colors')}>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-wider">
                                    Devolución
                                </span>
                                <span className="text-slate-500 text-sm font-mono">{sale.docNumber}</span>
                            </div>
                            <h4 className="text-xl font-semibold text-white">{sale.clientName}</h4>
                            <p className="text-slate-400 text-sm mt-1">Procesado por {sale.user} el {new Date(sale.datetime).toLocaleString()}</p>
                        </div>

                        <div className="text-right">
                            <p className="text-sm text-slate-500 uppercase tracking-wider">Monto Reembolsado</p>
                            <p className="text-3xl font-bold text-rose-400">{formatMoney(sale.total)}</p>
                        </div>

                        <button
                            onClick={() => setSelectedSale(sale.id)}
                            className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                        >
                            Ver Detalles
                        </button>
                    </div>
                ))}

                {data.length === 0 && !loading && (
                    <div className="text-center py-12 text-slate-500 bg-white/5 rounded-3xl border border-white/5">
                        No hay devoluciones registradas en este periodo.
                    </div>
                )}
            </div>

            <div className="flex justify-center gap-4 mt-8">
                <button disabled={!hasPrev} onClick={() => setPage(page - 1)} className="px-4 py-2 rounded-lg hover:bg-white/5 disabled:opacity-50">Anterior</button>
                <span className="py-2 text-slate-500">Página {page}</span>
                <button disabled={!hasNext} onClick={() => setPage(page + 1)} className="px-4 py-2 rounded-lg hover:bg-white/5 disabled:opacity-50">Siguiente</button>
            </div>

            <SaleReportModal saleId={selectedSale} onClose={() => setSelectedSale(null)} />
        </section>
    );
};

export default ReturnsList;
