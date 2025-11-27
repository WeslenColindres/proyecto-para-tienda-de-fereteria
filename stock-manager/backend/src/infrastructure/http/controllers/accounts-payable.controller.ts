import { Request, Response } from 'express';
import { AccountsPayableRepository } from '../../repositories/accounts-payable.repository';
import { AccountsPayable } from '../../../domain/entities/AccountsPayable';
import { Payment } from '../../../domain/entities/Payment';
import { v4 as uuidv4 } from 'uuid';

const mapAccountToFrontend = (account: AccountsPayable) => ({
    id: account.id,
    purchaseOrderId: account.props.purchaseOrderId,
    supplierId: account.props.supplierId,
    invoiceNumber: account.props.invoiceNumber,
    invoiceDate: account.props.invoiceDate,
    dueDate: account.props.dueDate,
    totalAmount: account.props.totalAmount,
    paidAmount: account.props.paidAmount,
    pendingAmount: account.props.pendingAmount,
    status: account.props.status,
    invoiceDocumentUrl: account.props.invoiceDocumentUrl,
    notes: account.props.notes
});

export const AccountsPayableController = {
    list: async (req: Request, res: Response) => {
        try {
            const { page, pageSize, supplierId, status } = req.query;

            const result = await AccountsPayableRepository.findAll({
                page: page ? parseInt(page as string) : undefined,
                pageSize: pageSize ? parseInt(pageSize as string) : undefined,
                supplierId: supplierId as string,
                status: status as string
            });

            res.json({
                data: result.data.map(mapAccountToFrontend),
                total: result.total,
                page: result.page,
                pageSize: result.pageSize
            });
        } catch (error) {
            console.error('Error listing accounts:', error);
            res.status(500).json({ message: 'Error al obtener cuentas por pagar' });
        }
    },

    registerPayment: async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const { amount, paymentDate, paymentMethod, referenceNumber, notes } = req.body;
            const userId = (req as any).user?.id || '1';

            const account = await AccountsPayableRepository.findById(id);
            if (!account) {
                return res.status(404).json({ message: 'Cuenta por pagar no encontrada' });
            }

            const payment = new Payment({
                id: uuidv4(),
                accountsPayableId: id,
                amount: parseFloat(amount),
                paymentDate: new Date(paymentDate),
                paymentMethod,
                referenceNumber,
                notes,
                createdBy: userId,
                createdAt: new Date()
            });

            // Domain logic validation
            account.registerPayment(payment.amount);

            // Persist
            await AccountsPayableRepository.registerPayment(id, payment);

            res.json({ success: true, message: 'Pago registrado correctamente' });
        } catch (error: any) {
            console.error('Error registering payment:', error);
            res.status(500).json({ message: error.message || 'Error al registrar pago' });
        }
    },

    getAgingReport: async (req: Request, res: Response) => {
        try {
            const { supplierId } = req.query;
            const report = await AccountsPayableRepository.getAgingReport(supplierId as string);
            res.json(report);
        } catch (error) {
            console.error('Error getting aging report:', error);
            res.status(500).json({ message: 'Error al obtener reporte de antigüedad' });
        }
    }
};
