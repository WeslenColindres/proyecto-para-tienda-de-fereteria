import { Router } from 'express';
import { ClientsController } from '../controllers/clients.controller';

const router = Router();
const clientsController = new ClientsController();

// Search clients
router.get('/search', (req, res) => clientsController.searchClients(req, res));

// List clients (with pagination)
router.get('/', (req, res) => clientsController.getClients(req, res));

// Get client by NIT
router.get('/nit/:nit', (req, res) => clientsController.getClientByNit(req, res));

// Create new client
router.post('/', (req, res) => clientsController.createClient(req, res));

// Update client
router.put('/:id', (req, res) => clientsController.updateClient(req, res));

// Delete client
router.delete('/:id', (req, res) => clientsController.deleteClient(req, res));

// Client sales history
router.get('/:id/sales', (req, res) => clientsController.getClientSales(req, res));

// Client credit info
router.get('/:id/credit', (req, res) => clientsController.getClientCredit(req, res));

export default router;
