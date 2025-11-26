import { useMemo, useState } from 'react';
import { salesApi } from '@/shared/api/sales';
import { useSalesChunks } from '@/shared/hooks/useSalesChunks';
import type { SaleDocumentType, SaleStatus } from '@/shared/types/sales';
import { cn } from '@/shared/utils/cn';
import SaleReportModal from './SaleReportModal';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

type SalesListProps = {
  variant: 'facturas' | 'devoluciones';
};

const formatMoney = (value: number) =>
  value.toLocaleString('es-GT', { style: 'currency', currency: 'GTQ', minimumFractionDigits: 2, maximumFractionDigits: 2 });

const panelBase =
  'rounded-3xl border border-white/10 bg-gradient-to-b from-[#050b18] via-[#040713] to-[#010409] shadow-[0_30px_80px_rgba(3,7,17,0.75)]';
const ghostButton =
  'rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-white/40 hover:text-white';
const inputBase =
  'h-11 rounded-2xl border border-white/10 bg-white/5 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal-400 focus:outline-none focus:ring-0';

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

const typeLabel: Record<SaleDocumentType, string> = {
  FACTURA: 'Factura',
  FACTURA_NUEVO: 'Factura nuevo cliente',
  COMPROBANTE: 'Comprobante',
};

const SalesList = ({ variant }: SalesListProps) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [docType, setDocType] = useState<'all' | SaleDocumentType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | SaleStatus>('all');
  const [clientFilter, setClientFilter] = useState('');
  const [query, setQuery] = useState('');
  const [selectedSale, setSelectedSale] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const filters = useMemo(
    () => ({
      docType: docType === 'all' ? undefined : docType,
      status: statusFilter === 'all' ? undefined : statusFilter,
      search: [clientFilter, query].filter(Boolean).join(' ').trim() || undefined,
      returnsOnly: variant === 'devoluciones',
      from: fromDate || undefined,
      to: toDate || undefined,
      pageSize: 12,
    }),
    [clientFilter, docType, fromDate, query, statusFilter, toDate, variant],
  );

  const { data, loading, error, page, pageSize, total, setPage, hasNext, hasPrev, reload } = useSalesChunks(filters);

  const isReturns = variant === 'devoluciones';
  const eyebrow = isReturns ? 'Devoluciones y notas de crédito' : 'Facturas y comprobantes';
  const heading = isReturns ? 'Revisa y gestiona tus devoluciones' : 'Busca, filtra y reimprime tus documentos';

  const currentPageTotal = data.reduce((acc, sale) => acc + sale.total, 0);

  const exportToExcel = () => {
    try {
      const rows = data.map((sale) => ({
        Fecha: new Date(sale.datetime).toLocaleString(),
        Documento: sale.docNumber,
        Cliente: sale.clientName,
        Usuario: sale.user,
        Tipo: typeLabel[sale.docType],
        Total: sale.total,
        Estado: statusLabel[sale.status],
      }));
      const sheet = XLSX.utils.json_to_sheet(rows);
      const book = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(book, sheet, 'Ventas');
      XLSX.writeFile(book, 'ventas.xlsx');
      setExportError(null);
    } catch (err) {
      setExportError('No se pudo exportar a Excel');
    }
  };

  const exportToPdf = () => {
    try {
      const doc = new jsPDF();
      doc.text('Ventas', 14, 16);
      (doc as any).autoTable({
        head: [['Fecha', 'Documento', 'Cliente', 'Usuario', 'Tipo', 'Total', 'Estado']],
        body: data.map((sale) => [
          new Date(sale.datetime).toLocaleString(),
          sale.docNumber,
          sale.clientName,
          sale.user,
          typeLabel[sale.docType],
          formatMoney(sale.total),
          statusLabel[sale.status],
        ]),
        startY: 20,
      });
      doc.save('ventas.pdf');
      setExportError(null);
    } catch (err) {
      setExportError('No se pudo exportar a PDF');
    }
  };

  const pagesCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <section className="flex flex-col gap-4 text-slate-100" data-tailwind-view="sales-list">
      <div className={cn(panelBase, 'flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-end lg:justify-between')}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">{eyebrow}</p>
          <h3 className="mt-1 text-2xl font-semibold text-white">{heading}</h3>
          <p className="text-sm text-slate-400">Conectado al backend en tiempo real con WebSocket.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={ghostButton} onClick={exportToExcel} disabled={data.length === 0}>
            [XLS] Exportar a Excel
          </button>
          <button type="button" className={ghostButton} onClick={exportToPdf} disabled={data.length === 0}>
            [PDF] Exportar a PDF
          </button>
          <button type="button" className={ghostButton} onClick={() => setSelectedSale(data[0]?.id ?? null)} disabled={data.length === 0}>
            [Rpt] Ver reporte detallado
          </button>
        </div>
      </div>

      <div className={cn(panelBase, 'px-5 py-5')}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Desde
            <input type="date" className={inputBase} value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </label>
          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Hasta
            <input type="date" className={inputBase} value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </label>
          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Tipo de documento
            <select className={cn(inputBase, 'bg-[#050b18]')} value={docType} onChange={(e) => setDocType(e.target.value as 'all' | SaleDocumentType)}>
              <option value="all">Todos</option>
              <option value="FACTURA">Factura</option>
              <option value="FACTURA_NUEVO">Factura nuevo cliente</option>
              <option value="COMPROBANTE">Comprobante</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Estado
            <select className={cn(inputBase, 'bg-[#050b18]')} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}>
              <option value="all">Todos</option>
              <option value="pagada">Pagada</option>
              <option value="pendiente">Pendiente</option>
              <option value="anulada">Anulada</option>
            </select>
          </label>
        </div>

        <div className={cn('mt-4 grid gap-4 md:grid-cols-2', isReturns ? 'xl:[grid-template-columns:repeat(3,minmax(0,1fr))_auto_auto]' : 'xl:[grid-template-columns:repeat(2,minmax(0,1fr))_auto_auto]')}>
          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Cliente
            <input
              type="text"
              placeholder="Nombre o NIT del cliente"
              className={inputBase}
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Buscador general
            <input
              type="text"
              placeholder="N.° doc, cliente o usuario"
              className={inputBase}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>

          <div className="flex flex-wrap items-center gap-2 self-end">
            <button
              type="button"
              className="rounded-2xl bg-gradient-to-r from-teal-400 to-sky-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg"
              onClick={() => reload()}
            >
              Buscar
            </button>
            <button type="button" className={ghostButton} onClick={() => setPage(Math.max(1, page - 1))} disabled={!hasPrev}>
              Página previa
            </button>
            <button type="button" className={ghostButton} onClick={() => setPage(page + 1)} disabled={!hasNext}>
              Página siguiente
            </button>
          </div>
        </div>

        {exportError && <p className="mt-2 text-sm text-rose-300">{exportError}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className={cn(panelBase, 'space-y-1 px-4 py-4')}>
          <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Documentos cargados</p>
          <p className="text-2xl font-semibold text-white">{data.length}</p>
          <p className="text-sm text-slate-400">Página {page} de {pagesCount}</p>
        </div>
        <div className={cn(panelBase, 'space-y-1 px-4 py-4')}>
          <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Total en página</p>
          <p className="text-2xl font-semibold text-white">{formatMoney(currentPageTotal)}</p>
          <p className="text-sm text-slate-400">Actualizado en tiempo real</p>
        </div>
        <div className={cn(panelBase, 'space-y-1 px-4 py-4')}>
          <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Documentos activos</p>
          <p className="text-2xl font-semibold text-white">{total}</p>
          <p className="text-sm text-slate-400">Resultados totales</p>
        </div>
        <div className={cn(panelBase, 'space-y-1 px-4 py-4')}>
          <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Estado</p>
          <p className="text-2xl font-semibold text-white">{loading ? 'Cargando' : 'En línea'}</p>
          <p className="text-sm text-slate-400">{error ?? 'Sincronizado con backend'}</p>
        </div>
      </div>

      {error && <div className={cn(panelBase, 'px-5 py-6 text-sm text-rose-200')}>{error}</div>}

      {!error && data.length === 0 && !loading && (
        <div className={cn(panelBase, 'px-5 py-6 text-center text-sm text-slate-400')}>
          No se encontraron documentos con los filtros actuales. Ajusta los filtros o limpia la búsqueda.
        </div>
      )}

      {!loading && data.length > 0 && (
        <>
          <div className={cn(panelBase, 'hidden text-sm lg:grid')}>
            <div className="grid grid-cols-[180px_180px_1fr_140px_140px_140px_160px] border-b border-white/5 pb-3 text-xs uppercase tracking-[0.35em] text-slate-400">
              <span>Fecha</span>
              <span>N.° documento</span>
              <span>Cliente</span>
              <span>{isReturns ? 'Origen' : 'Tipo'}</span>
              <span>Total</span>
              <span>Usuario</span>
              <span>Acciones</span>
            </div>
            <div className="divide-y divide-white/5">
              {data.map((sale) => (
                <div key={sale.id} className="grid grid-cols-[180px_180px_1fr_140px_140px_140px_160px] items-center gap-2 py-4 text-sm">
                  <span className="font-mono text-xs uppercase tracking-wide text-slate-400">
                    {new Date(sale.datetime).toLocaleString()}
                  </span>
                  <span className="font-semibold text-white">{sale.docNumber}</span>
                  <div className="truncate">
                    <p>{sale.clientName}</p>
                    <p className="text-xs text-slate-500">NIT: {sale.clientNit}</p>
                  </div>
                  <span className="text-slate-400">{typeLabel[sale.docType]}</span>
                  <span className="font-semibold text-white">{formatMoney(sale.total)}</span>
                  <span className="text-slate-400">{sale.user}</span>
                  <div className="flex justify-end gap-2">
                    <span className={cn('w-fit rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em]', statusStyles[sale.status])}>
                      {statusLabel[sale.status]}
                    </span>
                    <button
                      type="button"
                      className="rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-400 px-3 py-2 text-xs font-semibold text-slate-900"
                      onClick={() => setSelectedSale(sale.id)}
                    >
                      Ver detalle
                    </button>
                    <button
                      type="button"
                      className={ghostButton}
                      onClick={() => salesApi.getById(sale.id).then((data) => console.log('Reimprimir', data.docNumber)).catch(() => undefined)}
                    >
                      Reimprimir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 lg:hidden">
            {data.map((sale) => (
              <div key={sale.id} className={cn(panelBase, 'space-y-3 text-sm px-4 py-4')}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                      {sale.docNumber} · {new Date(sale.datetime).toLocaleString()}
                    </p>
                    <p className="text-slate-400">Cliente: {sale.clientName}</p>
                  </div>
                  <span className={cn('rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em]', statusStyles[sale.status])}>
                    {statusLabel[sale.status]}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{typeLabel[sale.docType]} · Cajero: {sale.user}</span>
                  <span>Total</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-2xl font-semibold text-white">{formatMoney(sale.total)}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-400 px-3 py-2 text-xs font-semibold text-slate-900"
                      onClick={() => setSelectedSale(sale.id)}
                    >
                      Ver detalle
                    </button>
                    <button type="button" className={ghostButton} onClick={() => setSelectedSale(sale.id)}>
                      Más opciones
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {loading && (
        <div className={cn(panelBase, 'px-5 py-6 text-sm text-slate-400')}>
          Cargando documentos y precargando siguientes páginas...
        </div>
      )}

      <div className="flex flex-col gap-2 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button type="button" className={ghostButton} aria-label="Página anterior" onClick={() => setPage(page - 1)} disabled={!hasPrev}>
            &lt;
          </button>
          <span className="text-white">
            {page}/{pagesCount}
          </span>
          <button type="button" className={ghostButton} aria-label="Página siguiente" onClick={() => setPage(page + 1)} disabled={!hasNext}>
            &gt;
          </button>
        </div>
        <p className="text-slate-500">
          Mostrando {data.length} resultados · Total: {total} · Tamaño de página: {pageSize}
        </p>
      </div>

      <SaleReportModal saleId={selectedSale} onClose={() => setSelectedSale(null)} />
    </section>
  );
};

export default SalesList;
