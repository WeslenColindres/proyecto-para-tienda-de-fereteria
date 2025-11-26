import type { Notification } from '@/shared/hooks/useNotifications';

interface NotificationCenterProps {
    notifications: Notification[];
    unreadCount: number;
    onMarkAsRead: (id: string) => void;
    onDelete: (id: string) => void;
    onClose: () => void;
    isOpen: boolean;
}

const NotificationCenter = ({
    notifications,
    unreadCount,
    onMarkAsRead,
    onDelete,
    onClose,
    isOpen,
}: NotificationCenterProps) => {
    if (!isOpen) return null;

    const getPriorityColor = (priority: Notification['priority']) => {
        switch (priority) {
            case 'error':
                return 'bg-red-100 border-red-300 dark:bg-red-900/20 dark:border-red-700';
            case 'warning':
                return 'bg-yellow-100 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-700';
            case 'success':
                return 'bg-green-100 border-green-300 dark:bg-green-900/20 dark:border-green-700';
            default:
                return 'bg-blue-100 border-blue-300 dark:bg-blue-900/20 dark:border-blue-700';
        }
    };

    const getPriorityIcon = (priority: Notification['priority']) => {
        switch (priority) {
            case 'error':
                return '❌';
            case 'warning':
                return '⚠️';
            case 'success':
                return '✅';
            default:
                return 'ℹ️';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Ahora';
        if (minutes < 60) return `Hace ${minutes}m`;
        if (hours < 24) return `Hace ${hours}h`;
        return `Hace ${days}d`;
    };

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/20 z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Panel de notificaciones */}
            <div className="fixed right-4 top-16 w-96 max-h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl z-50 flex flex-col border border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Notificaciones
                        {unreadCount > 0 && (
                            <span className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                        aria-label="Cerrar"
                    >
                        ✕
                    </button>
                </div>

                {/* Lista de notificaciones */}
                <div className="flex-1 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            <div className="text-4xl mb-2">🔔</div>
                            <p>No hay notificaciones</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 ${!notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="text-2xl flex-shrink-0">
                                            {getPriorityIcon(notification.priority)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                                    {notification.title}
                                                </h4>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                                                    {formatDate(notification.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span
                                                    className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(
                                                        notification.priority
                                                    )}`}
                                                >
                                                    {notification.type}
                                                </span>
                                                {!notification.isRead && (
                                                    <button
                                                        onClick={() => onMarkAsRead(notification.id)}
                                                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                                    >
                                                        Marcar como leída
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => onDelete(notification.id)}
                                                    className="text-xs text-red-600 dark:text-red-400 hover:underline ml-auto"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default NotificationCenter;
