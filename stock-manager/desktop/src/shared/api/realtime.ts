import type { RealtimeEvent, RealtimeHandler } from '../types/realtime';
import { getWsUrl } from './httpClient';

const WS_URL = getWsUrl();

let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let retryDelay = 1500;
const listeners = new Set<RealtimeHandler>();

function connect() {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return;

  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    retryDelay = 1500;
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as RealtimeEvent;
      listeners.forEach((listener) => listener(data));
    } catch (error) {
      console.error('No se pudo parsear mensaje WS', error);
    }
  };

  socket.onclose = () => {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(connect, retryDelay);
    retryDelay = Math.min(retryDelay * 2, 15000); // backoff simple para evitar spam
  };

  socket.onerror = () => {
    // Si falla el handshake no forzamos close inmediato para evitar el error "closed before established".
    // Dejamos que onclose maneje el reintento.
  };
}

export function subscribeRealtime(handler: RealtimeHandler): () => void {
  connect();
  listeners.add(handler);

  return () => {
    listeners.delete(handler);
    if (listeners.size === 0 && socket) {
      if (socket.readyState === WebSocket.CONNECTING) {
        // Avoid "WebSocket is closed before the connection is established" warning
        const ws = socket;
        ws.onopen = () => ws.close();
        ws.onerror = () => { }; // Suppress errors for this socket
      } else {
        socket.close();
      }
      socket = null;
    }
  };
}
