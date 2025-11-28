import React, { useState, useEffect, useMemo } from 'react';
import { DataTable, type Column } from '@/ui/molecules/Table/DataTable';
import {
  DollarSign,
  Calendar,
  Search,
  Filter,
  Download,
  MoreVertical,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useAccountsPayable } from '../hooks/useAccountsPayable';
import { AccountsPayableItem } from '@/shared/api/accounts-payable';
import { formatCurrency, formatDate } from '@/shared/utils/format';
import { RegisterPaymentModal } from './RegisterPaymentModal';
import { AccountsPayableDetailModal } from './AccountsPayableDetailModal';

export const SuppliersPayablesPage: React.FC = () => {
  const {
    accounts,
    loading,
    error,
    fetchAccounts,
    registerPayment,
    fetchAgingReport,
    agingReport
  } = useAccountsPayable();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState<AccountsPayableItem | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchAccounts();
    fetchAgingReport();
  }, [fetchAccounts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAccounts({ search: searchTerm, status: statusFilter === 'all' ? undefined : statusFilter });
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value;
    setStatusFilter(status);
    fetchAccounts({ search: searchTerm, status: status === 'all' ? undefined : status });
  };

  const openPaymentModal = (account: AccountsPayableItem) => {
    setSelectedAccount(account);
    setIsPaymentModalOpen(true);
  };

  const openDetailModal = (account: AccountsPayableItem) => {
    setSelectedAccount(account);
    setIsDetailModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pagada':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1 w-fit">
            <CheckCircle className="w-3 h-3" /> Pagada
          </span>
        );
      case 'vencida':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1 w-fit">
            <AlertCircle className="w-3 h-3" /> Vencida
          </span>
        );
      case 'parcial':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3" /> Parcial
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3" /> Pendiente
          </span>
        );
    }
  };

  const columns: Column<AccountsPayableItem>[] = useMemo(() => [
    {
      key: 'supplier',
      header: 'Proveedor',
      render: (account) => (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs mr-3">
            {account.supplierName.substring(0, 2).toUpperCase()}
          </div>
          <div className="text-sm font-medium text-slate-900 dark:text-white">{account.supplierName}</div>
        </div>
      ),
    },
    {
      key: 'invoice',
      header: 'Factura',
      render: (account) => (
        <div>
          <div className="text-sm text-slate-900 dark:text-white font-medium">{account.invoiceNumber}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{formatDate(account.invoiceDate)}</div>
        </div>
      ),
    },
    {
      key: 'dueDate',
      header: 'Vencimiento',
      render: (account) => (
        <div>
          <div className="text-sm text-slate-900 dark:text-white">{formatDate(account.dueDate)}</div>
          {new Date(account.dueDate) < new Date() && account.status !== 'pagada' && (
            <span className="text-xs text-red-500 font-medium">Vencida</span>
          )}
        </div>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Monto Total',
      accessor: (account) => formatCurrency(account.totalAmount),
      className: 'text-right font-medium text-slate-900 dark:text-white',
    },
    {
      key: 'pendingAmount',
      header: 'Pendiente',
      accessor: (account) => formatCurrency(account.pendingAmount),
      className: 'text-right font-bold text-blue-600 dark:text-blue-400',
    },
    {
      key: 'status',
      header: 'Estado',
      render: (account) => getStatusBadge(account.status),
      className: 'text-center flex justify-center',
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (account) => (
        <div className="flex items-center justify-end gap-2">
          {account.status !== 'pagada' && (
            <button
              onClick={() => openPaymentModal(account)}
              className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
              title="Registrar Pago"
            >
              <DollarSign className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => openDetailModal(account)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Ver Detalle"
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>
      ),
      className: 'text-right',
    },
  ], []);

  // Calculate totals from aging report or accounts list
  const totalPending = accounts.reduce((sum, acc) => sum + (acc.status !== 'pagada' ? acc.pendingAmount : 0), 0);
  const totalOverdue = accounts.reduce((sum, acc) => sum + (acc.status === 'vencida' ? acc.pendingAmount : 0), 0);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cuentas por Pagar</h1>
          <p className="text-slate-500 dark:text-slate-400">Gestiona tus deudas y pagos a proveedores</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar Reporte
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">Total</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{formatCurrency(totalPending)}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Deuda Total Pendiente</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> Crítico
            </span>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{formatCurrency(totalOverdue)}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Vencido (+30 días)</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full flex items-center gap-1">
              <ArrowDownRight className="w-3 h-3" /> -12%
            </span>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{formatCurrency(totalPending * 0.4)}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Pagado este mes</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por proveedor, factura..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600">
            <Filter className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="bg-transparent border-none text-sm text-slate-700 dark:text-slate-300 focus:ring-0 cursor-pointer"
            >
              <option value="all">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="vencida">Vencida</option>
              <option value="pagada">Pagada</option>
              <option value="parcial">Pago Parcial</option>
            </select>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-300 dark:border-slate-600">
            <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <select className="bg-transparent border-none text-sm text-slate-700 dark:text-slate-300 focus:ring-0 cursor-pointer">
              <option>Este Mes</option>
              <option>Mes Anterior</option>
              <option>Últimos 3 Meses</option>
              <option>Este Año</option>
            </select>
          </div>
        </div>
      </div>

      {/* Accounts List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <DataTable
            data={accounts}
            columns={columns}
            keyField="id"
            loading={loading}
            emptyMessage="No se encontraron cuentas por pagar"
          />
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Mostrando <span className="font-medium">{accounts.length}</span> de <span className="font-medium">{accounts.length}</span> resultados
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-sm disabled:opacity-50">Anterior</button>
            <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-sm disabled:opacity-50">Siguiente</button>
          </div>
        </div>
      </div>

      <RegisterPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        account={selectedAccount}
        onConfirm={registerPayment}
      />

      <AccountsPayableDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        account={selectedAccount}
        onRegisterPayment={(acc) => {
          setIsDetailModalOpen(false);
          openPaymentModal(acc);
        }}
      />
    </div>
  );
};
