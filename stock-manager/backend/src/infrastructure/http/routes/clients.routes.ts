import { Router } from 'express';
import { ClientsController } from '../controllers/clients.controller';

const router = Router();
const clientsController = new ClientsController();

// Search clients
router.get('/search', (req, res) => clientsController.searchClients(req, res));

// Get client by NIT
router.get('/nit/:nit', (req, res) => clientsController.getClientByNit(req, res));

// Create new client
router.post('/', (req, res) => clientsController.createClient(req, res));

export default router;
