import { useState, useEffect, useCallback } from 'react';
import {
    accountsPayableApi,
    AccountsPayableItem,
    ListAccountsPayableParams,
    PaymentPayload,
    AgingReportItem,
    SupplierReportItem
} from '@/shared/api/accounts-payable';

export function useAccountsPayable() {
    const [accounts, setAccounts] = useState<AccountsPayableItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [agingReport, setAgingReport] = useState<AgingReportItem[]>([]);
    const [supplierReport, setSupplierReport] = useState<SupplierReportItem[]>([]);

    const fetchAccounts = useCallback(async (params: ListAccountsPayableParams = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await accountsPayableApi.list({
                page,
                pageSize,
                ...params
            });
            setAccounts(response.data);
            setTotal(response.total);
        } catch (err) {
            setError('Error al cargar cuentas por pagar');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, pageSize]);

    const registerPayment = async (accountId: string, payload: PaymentPayload) => {
        setLoading(true);
        try {
            await accountsPayableApi.registerPayment(accountId, payload);
            await fetchAccounts(); // Refresh list
            return true;
        } catch (err) {
            setError('Error al registrar pago');
            console.error(err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const fetchAgingReport = async (supplierId?: string) => {
        try {
            const data = await accountsPayableApi.getAgingReport(supplierId);
            setAgingReport(data);
        } catch (err) {
            console.error('Error fetching aging report:', err);
        }
    };

    const fetchSupplierReport = async (startDate?: string, endDate?: string) => {
        try {
            const data = await accountsPayableApi.getSupplierReport({ startDate, endDate });
            setSupplierReport(data);
        } catch (err) {
            console.error('Error fetching supplier report:', err);
        }
    };

    const uploadInvoice = async (accountId: string, file: File) => {
        try {
            await accountsPayableApi.uploadInvoice(accountId, file);
            await fetchAccounts();
            return true;
        } catch (err) {
            console.error('Error uploading invoice:', err);
            return false;
        }
    };

    return {
        accounts,
        loading,
        error,
        total,
        page,
        pageSize,
        setPage,
        setPageSize,
        fetchAccounts,
        registerPayment,
        agingReport,
        fetchAgingReport,
        supplierReport,
        fetchSupplierReport,
        uploadInvoice
    };
}
