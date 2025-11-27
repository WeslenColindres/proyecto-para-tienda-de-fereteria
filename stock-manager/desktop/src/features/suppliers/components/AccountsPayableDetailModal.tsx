import React from 'react';
import { X, FileText, Calendar, DollarSign, Building2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { AccountsPayableItem } from '@/shared/api/accounts-payable';
import { formatCurrency, formatDate } from '@/shared/utils/format';

interface AccountsPayableDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    account: AccountsPayableItem | null;
    onRegisterPayment: (account: AccountsPayableItem) => void;
}

export const AccountsPayableDetailModal: React.FC<AccountsPayableDetailModalProps> = ({
    isOpen,
    onClose,
    account,
    onRegisterPayment
}) => {
    if (!isOpen || !account) return null;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pagada':
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Pagada
                    </span>
                );
            case 'vencida':
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Vencida
                    </span>
                );
            case 'parcial':
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Parcial
                    </span>
                );
            default:
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Pendiente
                    </span>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <FileText className="w-6 h-6 text-blue-600" />
                            Detalle de Cuenta por Pagar
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            ID: {account.id}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Header Info */}
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white text-lg">{account.supplierName}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Proveedor</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(account.status)}
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                Vence: <span className="font-medium text-slate-900 dark:text-white">{formatDate(account.dueDate)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Monto Total</div>
                            <div className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(account.totalAmount)}</div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-200 dark:border-green-900/30">
                            <div className="text-sm text-green-600 dark:text-green-400 mb-1">Pagado</div>
                            <div className="text-xl font-bold text-green-700 dark:text-green-400">{formatCurrency(account.paidAmount)}</div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-200 dark:border-blue-900/30">
                            <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Pendiente</div>
                            <div className="text-xl font-bold text-blue-700 dark:text-blue-400">{formatCurrency(account.pendingAmount)}</div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="font-medium text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
                                Información de Factura
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">No. Factura</span>
                                    <span className="text-sm font-medium text-slate-900 dark:text-white">{account.invoiceNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Fecha Emisión</span>
                                    <span className="text-sm font-medium text-slate-900 dark:text-white">{formatDate(account.invoiceDate)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Orden de Compra</span>
                                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">#{account.purchaseOrderId}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-medium text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
                                Documentos y Notas
                            </h4>
                            <div className="space-y-3">
                                {account.invoiceDocumentUrl ? (
                                    <a
                                        href={account.invoiceDocumentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
                                    >
                                        <FileText className="w-5 h-5 text-red-500" />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                            Ver Factura Adjunta
                                        </span>
                                    </a>
                                ) : (
                                    <div className="text-sm text-slate-400 italic">No hay factura adjunta</div>
                                )}

                                {account.notes && (
                                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-900/30">
                                        <p className="text-sm text-yellow-800 dark:text-yellow-200">{account.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium"
                    >
                        Cerrar
                    </button>
                    {account.status !== 'pagada' && (
                        <button
                            onClick={() => {
                                onClose();
                                onRegisterPayment(account);
                            }}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2 font-medium"
                        >
                            <DollarSign className="w-4 h-4" />
                            Registrar Pago
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
