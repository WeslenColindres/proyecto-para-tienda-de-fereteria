import { Request, Response } from 'express';
import { ClientService } from '../../../application/services/client.service';
import { PostgresClientRepository } from '../../repositories/postgres-client.repository';

const clientRepository = new PostgresClientRepository();
const clientService = new ClientService(clientRepository);

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
}
