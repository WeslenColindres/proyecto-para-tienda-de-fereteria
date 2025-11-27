import { memo, useState, useEffect } from 'react';
import Modal from '@/ui/molecules/Modal/Modal';
import { SaleClientInfo, SalePaymentSummary } from '@/shared/types/sales';
import { formatMoney } from '@/shared/utils/format';
import { cn } from '@/shared/utils/cn';
import { UserIcon, CurrencyDollarIcon, CreditCardIcon, BanknotesIcon, QrCodeIcon } from '@heroicons/react/24/outline';

interface PaymentModalProps {
    open: boolean;
    onClose: () => void;
    total: number;
    onConfirm: (client: SaleClientInfo, payment: SalePaymentSummary) => void;
    submitting: boolean;
}

const PaymentModal = memo(({ open, onClose, total, onConfirm, submitting }: PaymentModalProps) => {
    const [step, setStep] = useState<'client' | 'payment'>('client');
    const [client, setClient] = useState<SaleClientInfo>({
        nit: 'CF',
        name: 'Consumidor Final',
        phone: '',
        documentType: 'COMPROBANTE',
        status: 'consumidor-final',
    });
    const [paymentMethod, setPaymentMethod] = useState('Efectivo');
    const [paidWith, setPaidWith] = useState<string>(''); // Keep as string for input handling

    // Reset state when opening
    useEffect(() => {
        if (open) {
            setStep('client');
            setClient({
                nit: 'CF',
                name: 'Consumidor Final',
                phone: '',
                documentType: 'COMPROBANTE',
                status: 'consumidor-final',
            });
            setPaymentMethod('Efectivo');
            setPaidWith('');
        }
    }, [open]);

    const handleConfirm = () => {
        const paidAmount = parseFloat(paidWith) || 0;
        const change = paidAmount - total;

        onConfirm(client, {
            subtotal: total / 1.12, // Approx
            tax: total - (total / 1.12),
            total,
            paidWith: paidAmount,
            change,
            method: paymentMethod,
        });
    };

    const paidAmount = parseFloat(paidWith) || 0;
    const change = paidAmount - total;
    const isEnough = paidAmount >= total;

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={step === 'client' ? 'Datos del Cliente' : 'Finalizar Pago'}
            description={step === 'client' ? 'Ingrese los datos de facturación' : `Total a pagar: ${formatMoney(total)}`}
            maxWidth="max-w-2xl"
        >
            <div className="p-4 space-y-6">
                {/* Steps Indicator */}
                <div className="flex items-center justify-center gap-4 mb-6">
                    <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors", step === 'client' ? "bg-indigo-500/20 text-indigo-300" : "text-slate-500")}>
                        <div className="w-6 h-6 rounded-full bg-current flex items-center justify-center text-[10px] text-black font-bold">1</div>
                        Cliente
                    </div>
                    <div className="w-8 h-px bg-white/10" />
                    <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors", step === 'payment' ? "bg-indigo-500/20 text-indigo-300" : "text-slate-500")}>
                        <div className="w-6 h-6 rounded-full bg-current flex items-center justify-center text-[10px] text-black font-bold">2</div>
                        Pago
                    </div>
                </div>

                {step === 'client' ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500">NIT / DPI</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={client.nit}
                                        onChange={(e) => setClient({ ...client, nit: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500/50 focus:outline-none transition-colors"
                                        placeholder="CF"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500">Teléfono</label>
                                <input
                                    type="tel"
                                    value={client.phone}
                                    onChange={(e) => setClient({ ...client, phone: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500/50 focus:outline-none transition-colors"
                                    placeholder="Opcional"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-500">Nombre Completo</label>
                            <input
                                type="text"
                                value={client.name}
                                onChange={(e) => setClient({ ...client, name: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500/50 focus:outline-none transition-colors"
                                placeholder="Nombre del cliente"
                            />
                        </div>

                        <div className="space-y-2 pt-2">
                            <label className="text-xs font-bold uppercase text-slate-500">Tipo de Documento</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setClient({ ...client, documentType: 'FACTURA' })}
                                    className={cn(
                                        "flex items-center justify-center gap-2 py-3 rounded-xl border transition-all",
                                        client.documentType === 'FACTURA'
                                            ? "bg-indigo-600 border-transparent text-white shadow-lg shadow-indigo-500/20"
                                            : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                                    )}
                                >
                                    <span className="font-medium">Factura</span>
                                </button>
                                <button
                                    onClick={() => setClient({ ...client, documentType: 'COMPROBANTE' })}
                                    className={cn(
                                        "flex items-center justify-center gap-2 py-3 rounded-xl border transition-all",
                                        client.documentType === 'COMPROBANTE'
                                            ? "bg-indigo-600 border-transparent text-white shadow-lg shadow-indigo-500/20"
                                            : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                                    )}
                                >
                                    <span className="font-medium">Comprobante</span>
                                </button>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={() => setStep('payment')}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
                            >
                                Continuar a Pago
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        {/* Payment Methods */}
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: 'Efectivo', icon: BanknotesIcon },
                                { id: 'Tarjeta', icon: CreditCardIcon },
                                { id: 'Transferencia', icon: QrCodeIcon },
                            ].map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => setPaymentMethod(m.id)}
                                    className={cn(
                                        "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                                        paymentMethod === m.id
                                            ? "bg-indigo-600 border-transparent text-white shadow-lg shadow-indigo-500/20"
                                            : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                                    )}
                                >
                                    <m.icon className="w-6 h-6" />
                                    <span className="text-xs font-bold uppercase">{m.id}</span>
                                </button>
                            ))}
                        </div>

                        {/* Amount Input */}
                        <div className="bg-black/20 p-6 rounded-2xl border border-white/5 space-y-4">
                            <div className="flex justify-between items-center text-slate-400 text-sm">
                                <span>Total a Pagar</span>
                                <span className="text-white font-bold text-lg">{formatMoney(total)}</span>
                            </div>

                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xl">Q</span>
                                <input
                                    type="number"
                                    autoFocus
                                    value={paidWith}
                                    onChange={(e) => setPaidWith(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-4 text-2xl font-bold text-white focus:border-indigo-500/50 focus:outline-none transition-colors text-right placeholder:text-slate-600"
                                    placeholder="0.00"
                                />
                            </div>

                            {/* Quick Amounts */}
                            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                                <button
                                    onClick={() => setPaidWith(total.toString())}
                                    className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 text-xs font-bold border border-indigo-500/20 hover:bg-indigo-500/20 whitespace-nowrap"
                                >
                                    Exacto
                                </button>
                                {[50, 100, 200, 500].map(amount => (
                                    <button
                                        key={amount}
                                        onClick={() => setPaidWith(amount.toString())}
                                        className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-300 text-xs font-bold border border-white/5 hover:bg-white/10 whitespace-nowrap"
                                    >
                                        {formatMoney(amount)}
                                    </button>
                                ))}
                            </div>

                            {/* Change Display */}
                            <div className={cn(
                                "flex justify-between items-center p-4 rounded-xl border transition-colors",
                                change < 0 ? "bg-rose-500/10 border-rose-500/20" : "bg-emerald-500/10 border-emerald-500/20"
                            )}>
                                <span className={cn("text-sm font-bold uppercase", change < 0 ? "text-rose-400" : "text-emerald-400")}>
                                    {change < 0 ? "Faltante" : "Cambio"}
                                </span>
                                <span className={cn("text-2xl font-bold", change < 0 ? "text-rose-200" : "text-emerald-200")}>
                                    {formatMoney(Math.abs(change))}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <button
                                onClick={() => setStep('client')}
                                className="px-6 py-4 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Atrás
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={!isEnough || submitting}
                                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
                            >
                                {submitting ? 'Procesando...' : 'Confirmar Venta'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
});

export default PaymentModal;
