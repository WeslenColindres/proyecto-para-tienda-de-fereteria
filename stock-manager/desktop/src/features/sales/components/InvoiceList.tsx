import { useMemo, useState } from 'react';
import { DataTable, type Column } from '@/ui/molecules/Table/DataTable';
import { salesApi } from '@/shared/api/sales';
import { useSalesChunks } from '@/shared/hooks/useSalesChunks';
import type { SaleDocumentType, SaleStatus, SaleDetail } from '@/shared/types/sales';
import { cn } from '@/shared/utils/cn';
import SaleReportModal from './SaleReportModal';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const formatMoney = (value: number) =>
    value.toLocaleString('es-GT', { style: 'currency', currency: 'GTQ', minimumFractionDigits: 2, maximumFractionDigits: 2 });

const panelBase =
    'rounded-3xl border border-white/10 bg-gradient-to-b from-[#050b18] via-[#040713] to-[#010409] shadow-[0_30px_80px_rgba(3,7,17,0.75)]';
const ghostButton =
    'rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-white/40 hover:text-white';
const inputBase =
    'h-11 rounded-2xl border border-white/10 bg-white/5 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-0';

const statusStyles: Record<SaleStatus, string> = {
    pagada: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
    pendiente: 'border-amber-400/40 bg-amber-500/10 text-amber-200',
    anulada: 'border-rose-400/40 bg-rose-500/10 text-rose-200',
};

const statusLabel: Record<SaleStatus, string> = {
    pagada: 'Pagada',
    pendiente: 'Pendiente',
    anulada: 'Anulada',
};

const InvoiceList = () => {
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [docType, setDocType] = useState<'all' | 'FACTURA' | 'FACTURA_NUEVO'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | SaleStatus>('all');
    const [clientFilter, setClientFilter] = useState('');
    const [query, setQuery] = useState('');
    const [selectedSale, setSelectedSale] = useState<string | null>(null);
    const [exportError, setExportError] = useState<string | null>(null);

    const filters = useMemo(
        () => ({
            docType: docType === 'all' ? undefined : docType, // This might need adjustment if 'all' means both FACTURA types. For now, let's assume the API handles specific types or we filter on client side if needed, but API usually takes one. If 'all', it fetches all. We might need to filter client side or improve API.
            // Actually, if I send undefined, it fetches everything including receipts. I should probably default to FACTURA or filter in the UI if the API doesn't support list of types.
            // Let's assume for this specific view, we want to filter by FACTURA.
            // If the API only supports one type at a time, we might need to stick to one or 'all' (which includes receipts).
            // Ideally, the API should support filtering by multiple types or we just default to 'FACTURA' and let user switch to 'FACTURA_NUEVO'.
            // Let's default docType to 'FACTURA' to be safe for now, or 'all' if we want to show both but we need to filter out receipts.
            // Given the current API likely takes a single docType, let's allow switching between Factura types.
            status: statusFilter === 'all' ? undefined : statusFilter,
            search: [clientFilter, query].filter(Boolean).join(' ').trim() || undefined,
            returnsOnly: false,
            from: fromDate || undefined,
            to: toDate || undefined,
            pageSize: 12,
        }),
        [clientFilter, docType, fromDate, query, statusFilter, toDate],
    );

    // If docType is 'all', we might get receipts too. We should probably force a type or filter results.
    // For now, let's initialize docType to 'FACTURA' to ensure we see invoices.
    // But wait, the user might want to see all invoices (new and old).
    // If the API doesn't support "Any Invoice", we might have to pick one.
    // Let's check SalesList logic. It had a dropdown.
    // I'll keep the dropdown but only for Invoice types.

    const { data, loading, error, page, pageSize, total, setPage, hasNext, hasPrev, reload } = useSalesChunks(filters);

    // Filter data client-side if needed to ensure we only show invoices if we selected 'all' (which might return receipts)
    // But 'all' in the hook sends undefined, which returns everything.
    // We should probably refine the hook or API later. For now, let's just filter the displayed data if docType is 'all'.
    const displayedData = useMemo(() => {
        if (docType !== 'all') return data;
        return data.filter(d => d.docType === 'FACTURA' || d.docType === 'FACTURA_NUEVO');
    }, [data, docType]);

    const currentPageTotal = displayedData.reduce((acc, sale) => acc + sale.total, 0);

    const exportToExcel = () => {
        try {
            const rows = displayedData.map((sale) => ({
                Fecha: new Date(sale.datetime).toLocaleString(),
                Documento: sale.docNumber,
                Cliente: sale.clientName,
                NIT: sale.clientNit,
                Usuario: sale.user,
                Total: sale.total,
                Estado: statusLabel[sale.status],
            }));
            const sheet = XLSX.utils.json_to_sheet(rows);
            const book = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(book, sheet, 'Facturas');
            XLSX.writeFile(book, 'facturas.xlsx');
            setExportError(null);
        } catch (err) {
            setExportError('No se pudo exportar a Excel');
        }
    };

    const exportToPdf = () => {
        try {
            const doc = new jsPDF();
            doc.text('Reporte de Facturas', 14, 16);
            (doc as any).autoTable({
                head: [['Fecha', 'Documento', 'Cliente', 'NIT', 'Total', 'Estado']],
                body: displayedData.map((sale) => [
                    new Date(sale.datetime).toLocaleString(),
                    sale.docNumber,
                    sale.clientName,
                    sale.clientNit,
                    formatMoney(sale.total),
                    statusLabel[sale.status],
                ]),
                startY: 20,
            });
            doc.save('facturas.pdf');
            setExportError(null);
        } catch (err) {
            setExportError('No se pudo exportar a PDF');
        }
    };

    const pagesCount = Math.max(1, Math.ceil(total / pageSize));

    const columns: Column<SaleDetail>[] = useMemo(() => [
        {
            key: 'date',
            header: 'Fecha',
            render: (sale) => (
                <span className="text-slate-400">
                    {new Date(sale.datetime).toLocaleDateString()} <span className="text-xs text-slate-600">{new Date(sale.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </span>
            ),
            className: 'whitespace-nowrap',
        },
        { key: 'docNumber', header: 'Documento', accessor: 'docNumber', className: 'font-mono text-white' },
        {
            key: 'client',
            header: 'Cliente',
            render: (sale) => (
                <div>
                    <div className="font-medium text-slate-200">{sale.clientName}</div>
                    <div className="text-xs text-slate-500">NIT: {sale.clientNit}</div>
                </div>
            ),
        },
        {
            key: 'total',
            header: 'Total',
            accessor: (sale) => formatMoney(sale.total),
            className: 'text-right font-mono font-medium text-emerald-400',
        },
        {
            key: 'status',
            header: 'Estado',
            render: (sale) => (
                <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', statusStyles[sale.status])}>
                    {statusLabel[sale.status]}
                </span>
            ),
            className: 'text-center',
        },
        {
            key: 'actions',
            header: 'Acciones',
            render: (sale) => (
                <button
                    onClick={() => setSelectedSale(sale.id)}
                    className="text-indigo-400 hover:text-indigo-300 font-medium text-xs uppercase tracking-wide"
                >
                    Ver Detalle
                </button>
            ),
            className: 'text-right',
        },
    ], []);

    return (
        <section className="flex flex-col gap-6 text-slate-100" data-tailwind-view="invoice-list">
            <div className={cn(panelBase, 'flex flex-col gap-6 px-6 py-6 lg:flex-row lg:items-end lg:justify-between bg-gradient-to-r from-indigo-950/40 to-slate-950/40')}>
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.35em] text-indigo-400">Gestión Fiscal</p>
                    <h3 className="mt-2 text-3xl font-bold text-white tracking-tight">Facturas Emitidas</h3>
                    <p className="mt-1 text-sm text-slate-400">Control y seguimiento de documentos tributarios.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button type="button" className={ghostButton} onClick={exportToExcel} disabled={displayedData.length === 0}>
                        Exportar Excel
                    </button>
                    <button type="button" className={ghostButton} onClick={exportToPdf} disabled={displayedData.length === 0}>
                        Exportar PDF
                    </button>
                </div>
            </div>

            <div className={cn(panelBase, 'p-6')}>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Rango de Fechas</label>
                        <div className="flex gap-2">
                            <input type="date" className={cn(inputBase, 'w-full')} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                            <input type="date" className={cn(inputBase, 'w-full')} value={toDate} onChange={(e) => setToDate(e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tipo de Factura</label>
                        <select className={cn(inputBase, 'w-full bg-[#050b18]')} value={docType} onChange={(e) => setDocType(e.target.value as any)}>
                            <option value="all">Todas las facturas</option>
                            <option value="FACTURA">Factura Estándar</option>
                            <option value="FACTURA_NUEVO">Factura Nuevo Cliente</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Estado</label>
                        <select className={cn(inputBase, 'w-full bg-[#050b18]')} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
                            <option value="all">Todos los estados</option>
                            <option value="pagada">Pagada</option>
                            <option value="pendiente">Pendiente</option>
                            <option value="anulada">Anulada</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Búsqueda</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Cliente, NIT o Documento"
                                className={cn(inputBase, 'w-full')}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <button
                                type="button"
                                className="rounded-xl bg-indigo-500 px-4 text-white hover:bg-indigo-600"
                                onClick={() => reload()}
                            >
                                <span className="sr-only">Buscar</span>
                                🔍
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
                <div className={cn(panelBase, 'overflow-hidden')}>
                    <div className="overflow-x-auto">
                        <DataTable
                            data={displayedData}
                            columns={columns}
                            keyField="id"
                            loading={loading}
                            emptyMessage="No se encontraron facturas con los filtros seleccionados."
                            className="w-full text-left text-sm"
                            headerClassName="bg-white/5 text-xs uppercase tracking-wider text-slate-400"
                            rowClassName="hover:bg-white/5 transition-colors"
                        />
                    </div>

                    {/* Pagination */}
                    <div className="border-t border-white/5 px-6 py-4 flex items-center justify-between">
                        <button disabled={!hasPrev} onClick={() => setPage(page - 1)} className="text-sm text-slate-400 hover:text-white disabled:opacity-50">Anterior</button>
                        <span className="text-sm text-slate-500">Página {page} de {pagesCount}</span>
                        <button disabled={!hasNext} onClick={() => setPage(page + 1)} className="text-sm text-slate-400 hover:text-white disabled:opacity-50">Siguiente</button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className={cn(panelBase, 'p-6 space-y-4')}>
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Resumen</h4>
                        <div>
                            <p className="text-sm text-slate-400">Total en esta página</p>
                            <p className="text-3xl font-bold text-white">{formatMoney(currentPageTotal)}</p>
                        </div>
                        <div className="h-px bg-white/10" />
                        <div>
                            <p className="text-sm text-slate-400">Documentos listados</p>
                            <p className="text-xl font-semibold text-white">{displayedData.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <SaleReportModal saleId={selectedSale} onClose={() => setSelectedSale(null)} />
        </section>
    );
};

export default InvoiceList;
