import type { RealtimeEvent, RealtimeHandler } from '../types/realtime';

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:4000/ws';

let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<RealtimeHandler>();

function connect() {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return;

  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
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
    reconnectTimer = setTimeout(connect, 1500);
  };

  socket.onerror = () => {
    socket?.close();
  };
}

export function subscribeRealtime(handler: RealtimeHandler): () => void {
  connect();
  listeners.add(handler);

  return () => {
    listeners.delete(handler);
    if (listeners.size === 0 && socket) {
      socket.close();
      socket = null;
    }
  };
}

