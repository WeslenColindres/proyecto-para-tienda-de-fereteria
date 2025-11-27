import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './infrastructure/http/routes/auth.routes';
import inventoryRoutes from './infrastructure/http/routes/inventory.routes';
import salesRoutes from './infrastructure/http/routes/sales.routes';
import webhookRoutes from './infrastructure/http/routes/webhook.routes';
import suppliersRoutes from './infrastructure/http/routes/suppliers.routes';
import purchaseOrdersRoutes from './infrastructure/http/routes/purchase-orders.routes';
import accountsPayableRoutes from './infrastructure/http/routes/accounts-payable.routes';
import notificationsRoutes from './infrastructure/http/routes/notifications.routes';
import categoryRoutes from './infrastructure/http/routes/category.routes';
import dashboardRoutes from './infrastructure/http/routes/dashboard.routes';
import reportRoutes from './infrastructure/http/routes/report.routes';
import clientsRoutes from './infrastructure/http/routes/clients.routes';
import systemConfigRoutes from './infrastructure/http/routes/system-config.routes';
import { createServer } from 'http';
import path from 'path';
import { WebsocketHub } from './infrastructure/realtime/websocketHub';
import { createHealthRoutes } from './infrastructure/http/routes/health.routes';

dotenv.config();

const app = express();
const server = createServer(app);
// Initialize WebsocketHub
const wsHub = new WebsocketHub(server);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Allow serving static files
}));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/purchase-orders', purchaseOrdersRoutes);
app.use('/api/accounts-payable', accountsPayableRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/system-config', systemConfigRoutes);

// Health Check
app.use('/api/health', createHealthRoutes(wsHub));

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
