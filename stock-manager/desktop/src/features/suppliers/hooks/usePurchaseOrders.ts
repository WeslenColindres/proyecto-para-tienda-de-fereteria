import { useState, useCallback } from 'react';
import { purchaseOrdersApi } from '@/shared/api/purchase-orders';
import { PurchaseOrder, ListPurchaseOrdersParams, CreatePurchaseOrderPayload, ReceiveOrderPayload } from '../types';

export const usePurchaseOrders = () => {
    const [orders, setOrders] = useState<PurchaseOrder[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);

    const fetchOrders = useCallback(async (params: ListPurchaseOrdersParams) => {
        setLoading(true);
        setError(null);
        try {
            const result = await purchaseOrdersApi.list(params);
            setOrders(result.data);
            setTotal(result.total);
        } catch (err: any) {
            setError(err.message || 'Error al cargar órdenes de compra');
        } finally {
            setLoading(false);
        }
    }, []);

    const createOrder = async (payload: CreatePurchaseOrderPayload) => {
        setLoading(true);
        try {
            const newOrder = await purchaseOrdersApi.create(payload);
            setOrders(prev => [newOrder, ...prev]);
            return newOrder;
        } catch (err: any) {
            setError(err.message || 'Error al crear orden de compra');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const receiveOrder = async (id: string, payload: ReceiveOrderPayload) => {
        setLoading(true);
        try {
            await purchaseOrdersApi.receive(id, payload);
            // Refresh orders or update local state
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'RECIBIDA' } : o)); // Simplified update
        } catch (err: any) {
            setError(err.message || 'Error al recibir orden');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const uploadInvoice = async (id: string, file: File) => {
        setLoading(true);
        try {
            const result = await purchaseOrdersApi.uploadInvoice(id, file);
            setOrders(prev => prev.map(o => o.id === id ? { ...o, invoiceDocumentUrl: result.fileUrl } : o));
            return result;
        } catch (err: any) {
            setError(err.message || 'Error al subir factura');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        orders,
        total,
        loading,
        error,
        fetchOrders,
        createOrder,
        receiveOrder,
        uploadInvoice
    };
};
