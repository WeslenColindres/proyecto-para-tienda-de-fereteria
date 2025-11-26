import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './infrastructure/http/routes/auth.routes';
import inventoryRoutes from './infrastructure/http/routes/inventory.routes';
import salesRoutes from './infrastructure/http/routes/sales.routes';
import webhookRoutes from './infrastructure/http/routes/webhook.routes';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/webhooks', webhookRoutes);

// WebSocket
wss.on('connection', (ws) => {
  console.log('New client connected');
  ws.on('message', (message) => {
    console.log(`Received: ${message}`);
  });
  ws.send('Welcome to Stock Manager WebSocket');
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
