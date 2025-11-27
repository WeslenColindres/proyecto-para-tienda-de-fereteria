import type { Server } from 'http';
import { WebSocket, WebSocketServer } from 'ws';

export type RealtimeEvent =
  | { type: 'sale.created'; payload: unknown }
  | { type: 'inventory.updated'; payload: unknown }
  | { type: 'product.updated'; payload: unknown }
  | { type: 'product.deleted'; payload: unknown }
  | { type: 'category.updated'; payload: unknown }
  | { type: 'alert.created'; payload: unknown }
  | { type: 'supplier.created'; payload: unknown }
  | { type: 'supplier.updated'; payload: unknown }
  | { type: 'supplier.deleted'; payload: unknown }
  | { type: 'supplier.purchase.created'; payload: unknown }
  | { type: 'customer.created'; payload: unknown }
  | { type: 'customer.updated'; payload: unknown }
  | { type: 'customer.deleted'; payload: unknown }
  | { type: 'notification.created'; payload: unknown }
  | { type: 'notification.read'; payload: unknown }
  | { type: 'system.update_available'; payload: unknown }
  | { type: 'ready' };

export class WebsocketHub {
  private readonly wss: WebSocketServer;

  constructor(server: Server, private readonly webhookEndpoint?: string) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.wss.on('connection', (socket: WebSocket) => {
      socket.send(JSON.stringify({ type: 'ready' }));
    });
  }

  broadcast(event: RealtimeEvent) {
    const message = JSON.stringify(event);
    this.wss.clients.forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
    this.forwardToWebhook(event).catch(() => undefined);
  }

  private async forwardToWebhook(event: RealtimeEvent) {
    if (!this.webhookEndpoint) return;
    const fetchFn = (globalThis as any).fetch;
    if (typeof fetchFn !== 'function') return;
    try {
      await fetchFn(this.webhookEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Webhook notify failed', error);
    }
  }

  get clientCount(): number {
    return this.wss.clients.size;
  }
}
