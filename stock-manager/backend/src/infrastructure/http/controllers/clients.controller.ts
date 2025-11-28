import { Request, Response } from 'express';
import { ClientService } from '../../../application/services/client.service';
import { PostgresClientRepository } from '../../repositories/postgres-client.repository';

import { PostgresSaleRepository } from '../../repositories/postgres-sale.repository';

const clientRepository = new PostgresClientRepository();
const saleRepository = new PostgresSaleRepository();
const clientService = new ClientService(clientRepository, saleRepository);

export class ClientsController {
    /**
     * Search clients by name or NIT
     * GET /api/clients/search?q=searchTerm&limit=10
     */
    async searchClients(req: Request, res: Response) {
        try {
            const searchTerm = req.query.q as string;
            const limit = parseInt(req.query.limit as string) || 10;

            if (!searchTerm || searchTerm.trim().length === 0) {
                return res.json([]);
            }

            const clients = await clientService.searchClients(searchTerm, limit);

            // Map to frontend format
            const response = clients.map(c => ({
                id: c.id,
                nit: c.nit,
                name: c.name,
                tradeName: c.props.tradeName,
                phone: c.props.phone,
                email: c.props.email,
            }));

            res.json(response);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Get client by NIT
     * GET /api/clients/nit/:nit
     */
    async getClientByNit(req: Request, res: Response) {
        try {
            const nit = req.params.nit;
            const client = await clientService.getClientByNit(nit);

            if (!client) {
                return res.status(404).json({ message: 'Cliente no encontrado' });
            }

            res.json({
                id: client.id,
                nit: client.nit,
                name: client.name,
                tradeName: client.props.tradeName,
                phone: client.props.phone,
                email: client.props.email,
                creditLimit: client.props.creditLimit,
                creditDays: client.props.creditDays,
            });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * Create new client
     * POST /api/clients
     */
    async createClient(req: Request, res: Response) {
        try {
            const { nit, name, tradeName, email, phone } = req.body;

            if (!nit || !name) {
                return res.status(400).json({ message: 'NIT y nombre son requeridos' });
            }

            const client = await clientService.createClient({
                nit,
                name,
                tradeName,
                email,
                phone,
            });

            res.status(201).json({
                id: client.id,
                nit: client.nit,
                name: client.name,
                tradeName: client.props.tradeName,
                phone: client.props.phone,
                email: client.props.email,
            });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
    /**
     * Get clients with pagination
     * GET /api/clients
     */
    async getClients(req: Request, res: Response) {
        try {
            const params = {
                page: parseInt(req.query.page as string) || 1,
                limit: parseInt(req.query.limit as string) || 20,
                search: req.query.search as string,
                status: req.query.status as string,
                city: req.query.city as string,
                type: req.query.type as string,
            };

            const offset = (params.page - 1) * params.limit;
            const result = await clientService.getClients({ ...params, offset });

            res.json({
                data: result.clients.map(c => ({
                    id: c.id,
                    nit: c.nit,
                    name: c.name,
                    tradeName: c.props.tradeName,
                    phone: c.props.phone,
                    email: c.props.email,
                    city: 'Guatemala', // Placeholder as city is not in DB yet
                    type: c.props.clientTypeId === 1 ? 'persona-natural' : 'persona-juridica', // Mapping
                    status: c.props.isActive ? 'activo' : 'inactivo',
                    hasCredit: c.props.creditLimit > 0,
                    creditLimit: c.props.creditLimit,
                    creditDays: c.props.creditDays,
                })),
                total: result.total,
                page: params.page,
                totalPages: Math.ceil(result.total / params.limit)
            });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Update client
     * PUT /api/clients/:id
     */
    async updateClient(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const data = req.body;

            const client = await clientService.updateClient(id, data);
            res.json(client);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * Delete client
     * DELETE /api/clients/:id
     */
    async deleteClient(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            await clientService.deleteClient(id);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    /**
     * Get client sales history
     * GET /api/clients/:id/sales
     */
    async getClientSales(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const offset = (page - 1) * limit;

            const result = await clientService.getClientSales(id, { limit, offset });

            res.json({
                data: result.sales.map(s => ({
                    id: s.id,
                    date: s.props.saleDate,
                    documentNumber: s.documentNumber,
                    total: s.finalTotal,
                    status: s.props.status,
                    items: 0 // Placeholder, would need to fetch items count if needed
                })),
                total: result.total,
                page,
                totalPages: Math.ceil(result.total / limit)
            });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Get client credit info
     * GET /api/clients/:id/credit
     */
    async getClientCredit(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const credit = await clientService.getClientCredit(id);
            res.json(credit);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}
