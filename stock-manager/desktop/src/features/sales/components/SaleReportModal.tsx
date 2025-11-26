import { useCallback, useEffect, useMemo, useState } from 'react';
import { salesApi } from '@/shared/api/sales';
import { ApiError } from '@/shared/api/types';
import type { SaleDetail } from '@/shared/types/sales';
import Modal from '@/ui/molecules/Modal/Modal';

const formatMoney = (value: number) =>
  value.toLocaleString('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

type Props = {
  saleId: string | null;
  onClose: () => void;
};

const SaleReportModal = ({ saleId, onClose }: Props) => {
  const [sale, setSale] = useState<SaleDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSale = useCallback(() => {
    if (!saleId) return;
    setLoading(true);
    setError(null);
    salesApi
      .getById(saleId)
      .then((data) => setSale(data))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'No se pudo cargar el reporte'))
      .finally(() => setLoading(false));
  }, [saleId]);

  useEffect(() => {
    fetchSale();
  }, [fetchSale]);

  const totals = useMemo(() => {
    if (!sale) return null;
    return [
      { label: 'Subtotal', value: formatMoney(sale.subtotal) },
      { label: 'Impuestos', value: formatMoney(sale.tax) },
      { label: 'Total', value: formatMoney(sale.total) },
    ];
  }, [sale]);

  return (
    <Modal
      open={Boolean(saleId)}
      title={sale ? `Detalle de ${sale.docNumber}` : 'Detalle de venta'}
      description="Consulta r\u00e1pida del documento y sus partidas."
      onClose={onClose}
    >
      {loading && <p className="text-sm text-slate-400">Cargando venta...</p>}
      {error && (
        <div className="space-y-2 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-50">
          <p>{error}</p>
          <button
            type="button"
            className="rounded-xl bg-rose-500/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-100"
            onClick={fetchSale}
          >
            Reintentar
          </button>
        </div>
      )}

      {sale && (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Documento</p>
              <h4 className="text-lg font-semibold text-white">{sale.docNumber}</h4>
              <p className="text-sm text-slate-400">
                {sale.docType} \u2022 {new Date(sale.datetime).toLocaleString()}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Cliente</p>
              <h4 className="text-lg font-semibold text-white">{sale.clientName}</h4>
              <p className="text-sm text-slate-400">NIT: {sale.clientNit}</p>
              <p className="text-sm text-slate-400">Usuario: {sale.user}</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10">
            <div className="grid grid-cols-[1.5fr_80px_80px_100px] gap-3 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.3em] text-slate-400">
              <span>Producto</span>
              <span className="text-right">Cant.</span>
              <span className="text-right">Precio</span>
              <span className="text-right">Subtotal</span>
            </div>
            {sale.items.map((item) => (
              <div
                key={`${item.productId}-${item.code}`}
                className="grid grid-cols-[1.5fr_80px_80px_100px] items-center gap-3 px-4 py-3 text-sm text-slate-200 odd:bg-white/5"
              >
                <div>
                  <p className="font-semibold text-white">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.code}</p>
                </div>
                <span className="text-right">{item.qty}</span>
                <span className="text-right">{formatMoney(item.price)}</span>
                <span className="text-right font-semibold text-white">{formatMoney(item.subtotal)}</span>
              </div>
            ))}
          </div>

          {totals && (
            <div className="grid gap-3 md:grid-cols-3">
              {totals.map((row) => (
                <div key={row.label} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{row.label}</p>
                  <p className="text-lg font-semibold text-white">{row.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default SaleReportModal;
