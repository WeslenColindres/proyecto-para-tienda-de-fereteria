import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from '../api/httpClient';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'sale' | 'inventory' | 'product' | 'supplier' | 'customer' | 'system' | 'alert';
    priority: 'info' | 'warning' | 'error' | 'success';
    isRead: boolean;
    createdAt: string;
    readAt: string | null;
    metadata?: Record<string, unknown>;
}

interface NotificationAPI {
    show: (options: { title: string; body: string; urgency?: 'low' | 'normal' | 'critical' }) => Promise<{ success: boolean; error?: string }>;
    checkPermission: () => Promise<{ supported: boolean; permission: string }>;
}

declare global {
    interface Window {
        notifications?: NotificationAPI;
    }
}

const WS_URL = API_BASE_URL.replace(/^http/, 'ws') + '/ws';

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch notificaciones desde el backend
    const fetchNotifications = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/notifications`, {
                headers: {
                    'X-Source-App': 'stock-manager-desktop',
                },
            });

            if (!response.ok) throw new Error('Failed to fetch notifications');

            const data = await response.json();
            setNotifications(data.data || []);
            setUnreadCount(data.data?.filter((n: Notification) => !n.isRead).length || 0);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Marcar como leída
    const markAsRead = useCallback(async (id: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
                method: 'PATCH',
                headers: {
                    'X-Source-App': 'stock-manager-desktop',
                },
            });

            if (!response.ok) throw new Error('Failed to mark notification as read');

            // Actualizar estado local
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    }, []);

    // Eliminar notificación
    const deleteNotification = useCallback(async (id: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-Source-App': 'stock-manager-desktop',
                },
            });

            if (!response.ok) throw new Error('Failed to delete notification');

            // Actualizar estado local
            setNotifications((prev) => {
                const notification = prev.find((n) => n.id === id);
                if (notification && !notification.isRead) {
                    setUnreadCount((count) => Math.max(0, count - 1));
                }
                return prev.filter((n) => n.id !== id);
            });
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    }, []);

    // Mostrar notificación nativa del SO
    const showNativeNotification = useCallback(async (notification: Notification) => {
        if (!window.notifications) {
            console.warn('Native notifications API not available');
            return;
        }

        try {
            const urgency = notification.priority === 'error' ? 'critical' : notification.priority === 'warning' ? 'normal' : 'low';

            await window.notifications.show({
                title: notification.title,
                body: notification.message,
                urgency,
            });
        } catch (err) {
            console.error('Failed to show native notification:', err);
        }
    }, []);

    // Conectar WebSocket para notificaciones en tiempo real
    useEffect(() => {
        let isMounted = true;

        const connectWebSocket = () => {
            if (!isMounted) return;

            const ws = new WebSocket(WS_URL);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('[WebSocket] Connected for notifications');
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                    reconnectTimeoutRef.current = null;
                }
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.type === 'notification.created' && data.payload) {
                        const newNotification = data.payload as Notification;
                        setNotifications((prev) => [newNotification, ...prev]);
                        setUnreadCount((prev) => prev + 1);

                        // Mostrar notificación nativa
                        showNativeNotification(newNotification);
                    } else if (data.type === 'notification.read' && data.payload) {
                        const { id } = data.payload as { id: string };
                        setNotifications((prev) =>
                            prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
                        );
                        setUnreadCount((prev) => Math.max(0, prev - 1));
                    }
                } catch (err) {
                    console.error('[WebSocket] Failed to parse message:', err);
                }
            };

            ws.onerror = (error) => {
                console.error('[WebSocket] Error:', error);
            };

            ws.onclose = () => {
                console.log('[WebSocket] Disconnected');
                wsRef.current = null;

                // Intentar reconectar después de 5 segundos
                if (isMounted) {
                    reconnectTimeoutRef.current = setTimeout(() => {
                        console.log('[WebSocket] Attempting to reconnect...');
                        connectWebSocket();
                    }, 5000);
                }
            };
        };

        // Cargar notificaciones iniciales
        fetchNotifications();

        // Conectar WebSocket
        connectWebSocket();

        // Cleanup
        return () => {
            isMounted = false;
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
        };
    }, [fetchNotifications, showNativeNotification]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        deleteNotification,
        refresh: fetchNotifications,
    };
}
