import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, CreditCard, FileText } from 'lucide-react';
import { AccountsPayableItem, PaymentPayload } from '@/shared/api/accounts-payable';
import { formatCurrency } from '@/shared/utils/format';

interface RegisterPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    account: AccountsPayableItem | null;
    onConfirm: (accountId: string, payment: PaymentPayload) => Promise<boolean>;
}

export const RegisterPaymentModal: React.FC<RegisterPaymentModalProps> = ({
    isOpen,
    onClose,
    account,
    onConfirm
}) => {
    const [amount, setAmount] = useState<string>('');
    const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [paymentMethod, setPaymentMethod] = useState<string>('TRANSFERENCIA');
    const [referenceNumber, setReferenceNumber] = useState<string>('');
    const [notes, setNotes] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && account) {
            setAmount(account.pendingAmount.toString());
            setPaymentDate(new Date().toISOString().split('T')[0]);
            setPaymentMethod('TRANSFERENCIA');
            setReferenceNumber('');
            setNotes('');
            setError(null);
        }
    }, [isOpen, account]);

    if (!isOpen || !account) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const paymentAmount = parseFloat(amount);
        if (isNaN(paymentAmount) || paymentAmount <= 0) {
            setError('El monto debe ser mayor a 0');
            return;
        }

        if (paymentAmount > account.pendingAmount) {
            setError(`El monto no puede exceder el saldo pendiente (${formatCurrency(account.pendingAmount)})`);
            return;
        }

        setIsSubmitting(true);
        try {
            const success = await onConfirm(account.id, {
                amount: paymentAmount,
                paymentDate,
                paymentMethod,
                referenceNumber,
                notes
            });
            if (success) {
                onClose();
            }
        } catch (err) {
            setError('Error al registrar el pago');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <DollarSign className="w-6 h-6 text-green-600" />
                            Registrar Pago
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {account.supplierName} - Factura #{account.invoiceNumber}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-600 dark:text-slate-400">Total Factura:</span>
                            <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(account.totalAmount)}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-600 dark:text-slate-400">Pagado:</span>
                            <span className="font-medium text-green-600">{formatCurrency(account.paidAmount)}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold border-t border-blue-200 dark:border-blue-800 pt-2 mt-2">
                            <span className="text-blue-800 dark:text-blue-300">Pendiente:</span>
                            <span className="text-blue-800 dark:text-blue-300">{formatCurrency(account.pendingAmount)}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Monto a Pagar
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Fecha de Pago
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="date"
                                    required
                                    value={paymentDate}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Método de Pago
                            </label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none"
                                >
                                    <option value="EFECTIVO">Efectivo</option>
                                    <option value="TRANSFERENCIA">Transferencia</option>
                                    <option value="CHEQUE">Cheque</option>
                                    <option value="TARJETA">Tarjeta</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            No. Referencia / Cheque
                        </label>
                        <input
                            type="text"
                            value={referenceNumber}
                            onChange={(e) => setReferenceNumber(e.target.value)}
                            placeholder="Ej. 12345678"
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Notas
                        </label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                            />
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-lg hover:shadow-green-500/30 transition-all flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Registrando...
                            </>
                        ) : (
                            <>
                                <DollarSign className="w-4 h-4" />
                                Confirmar Pago
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
