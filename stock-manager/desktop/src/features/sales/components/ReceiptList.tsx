import { useMemo, useState } from 'react';
import { salesApi } from '@/shared/api/sales';
import { useSalesChunks } from '@/shared/hooks/useSalesChunks';
import type { SaleStatus } from '@/shared/types/sales';
import { cn } from '@/shared/utils/cn';
import SaleReportModal from './SaleReportModal';
import * as XLSX from 'xlsx';

const formatMoney = (value: number) =>
    value.toLocaleString('es-GT', { style: 'currency', currency: 'GTQ', minimumFractionDigits: 2, maximumFractionDigits: 2 });

const panelBase =
    'rounded-3xl border border-white/10 bg-[#020408] shadow-lg';
const ghostButton =
    'rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white';
const inputBase =
    'h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-sky-500 focus:outline-none focus:ring-0';

const statusStyles: Record<SaleStatus, string> = {
    pagada: 'text-sky-400',
    pendiente: 'text-amber-400',
    anulada: 'text-rose-400',
};

const ReceiptList = () => {
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | SaleStatus>('all');
    const [query, setQuery] = useState('');
    const [selectedSale, setSelectedSale] = useState<string | null>(null);

    const filters = useMemo(
        () => ({
            docType: 'COMPROBANTE' as const,
            status: statusFilter === 'all' ? undefined : statusFilter,
            search: query || undefined,
            returnsOnly: false,
            from: fromDate || undefined,
            to: toDate || undefined,
            pageSize: 20, // More items per page for receipts
        }),
        [fromDate, query, statusFilter, toDate],
    );

    const { data, loading, page, pageSize, total, setPage, hasNext, hasPrev, reload } = useSalesChunks(filters);

    const exportToExcel = () => {
        try {
            const rows = data.map((sale) => ({
                Fecha: new Date(sale.datetime).toLocaleString(),
                Documento: sale.docNumber,
                Cliente: sale.clientName,
                Total: sale.total,
                Estado: sale.status,
            }));
            const sheet = XLSX.utils.json_to_sheet(rows);
            const book = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(book, sheet, 'Comprobantes');
            XLSX.writeFile(book, 'comprobantes.xlsx');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <section className="flex flex-col gap-4 text-slate-100" data-tailwind-view="receipt-list">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-white">Comprobantes</h3>
                    <p className="text-sm text-slate-500">Recibos y comprobantes de venta rápida.</p>
                </div>
                <div className="flex gap-2">
                    <button type="button" className={ghostButton} onClick={exportToExcel} disabled={data.length === 0}>
                        Exportar
                    </button>
                </div>
            </div>

            <div className={cn(panelBase, 'p-4')}>
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <input
                            type="text"
                            placeholder="Buscar por cliente o documento..."
                            className={cn(inputBase, 'w-full')}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <div className="w-[150px]">
                        <select className={cn(inputBase, 'w-full bg-[#020408]')} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
                            <option value="all">Todos</option>
                            <option value="pagada">Pagada</option>
                            <option value="pendiente">Pendiente</option>
                            <option value="anulada">Anulada</option>
                        </select>
                    </div>
                    <input type="date" className={cn(inputBase, 'w-[140px]')} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                    <button
                        type="button"
                        className="h-10 rounded-xl bg-sky-600 px-4 font-medium text-white hover:bg-sky-500"
                        onClick={() => reload()}
                    >
                        Filtrar
                    </button>
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {data.map((sale) => (
                    <div key={sale.id} className={cn(panelBase, 'p-4 hover:bg-white/5 transition-colors cursor-pointer group')} onClick={() => setSelectedSale(sale.id)}>
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-mono text-xs text-slate-500">{sale.docNumber}</span>
                            <span className={cn('text-xs font-bold uppercase', statusStyles[sale.status])}>{sale.status}</span>
                        </div>
                        <div className="mb-3">
                            <p className="font-medium text-slate-200 truncate">{sale.clientName}</p>
                            <p className="text-xs text-slate-500">{new Date(sale.datetime).toLocaleDateString()}</p>
                        </div>
                        <div className="flex justify-between items-end border-t border-white/5 pt-3">
                            <span className="text-xs text-slate-500">Total</span>
                            <span className="text-lg font-bold text-white group-hover:text-sky-400 transition-colors">{formatMoney(sale.total)}</span>
                        </div>
                    </div>
                ))}
            </div>

            {data.length === 0 && !loading && (
                <div className="text-center py-12 text-slate-500">
                    No se encontraron comprobantes.
                </div>
            )}

            <div className="flex justify-center gap-2 mt-4">
                <button disabled={!hasPrev} onClick={() => setPage(page - 1)} className={ghostButton}>Anterior</button>
                <span className="flex items-center px-4 text-sm text-slate-500">Página {page}</span>
                <button disabled={!hasNext} onClick={() => setPage(page + 1)} className={ghostButton}>Siguiente</button>
            </div>

            <SaleReportModal saleId={selectedSale} onClose={() => setSelectedSale(null)} />
        </section>
    );
};

export default ReceiptList;
