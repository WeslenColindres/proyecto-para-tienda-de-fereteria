import type { NotificationPriority, NotificationType } from './notificationSchema';

export class NotificationEntity {
    constructor(
        public readonly id: string,
        public readonly title: string,
        public readonly message: string,
        public readonly type: NotificationType,
        public readonly priority: NotificationPriority,
        public isRead: boolean,
        public readonly createdAt: Date,
        public readAt: Date | null = null,
        public readonly metadata?: Record<string, unknown>,
    ) { }

    markAsRead(): void {
        this.isRead = true;
        this.readAt = new Date();
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            message: this.message,
            type: this.type,
            priority: this.priority,
            isRead: this.isRead,
            createdAt: this.createdAt,
            readAt: this.readAt,
            metadata: this.metadata,
        };
    }
}
