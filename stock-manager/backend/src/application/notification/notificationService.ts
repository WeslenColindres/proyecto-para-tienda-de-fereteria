import type { NotificationEntity } from '../../domain/notification/notification.entity';
import type { CreateNotificationDTO } from '../../domain/notification/notificationSchema';
import type { NotificationGateway } from '../../infrastructure/notification/postgresNotificationGateway';
import { logger } from '../../infrastructure/logger';

export class NotificationService {
    constructor(private readonly gateway: NotificationGateway) { }

    async createNotification(dto: CreateNotificationDTO): Promise<NotificationEntity> {
        try {
            const notification = await this.gateway.create(dto);
            logger.info('Notification service: created notification', {
                id: notification.id,
                type: notification.type,
            });
            return notification;
        } catch (error) {
            logger.error('Notification service: failed to create notification', {
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    async getNotificationById(id: string): Promise<NotificationEntity | null> {
        return this.gateway.findById(id);
    }

    async getAllNotifications(limit = 50, offset = 0): Promise<NotificationEntity[]> {
        return this.gateway.findAll(limit, offset);
    }

    async getUnreadNotifications(): Promise<NotificationEntity[]> {
        return this.gateway.findUnread();
    }

    async markAsRead(id: string): Promise<void> {
        try {
            await this.gateway.markAsRead(id);
            logger.info('Notification service: marked as read', { id });
        } catch (error) {
            logger.error('Notification service: failed to mark as read', {
                error: error instanceof Error ? error.message : String(error),
                id,
            });
            throw error;
        }
    }

    async deleteNotification(id: string): Promise<void> {
        try {
            await this.gateway.delete(id);
            logger.info('Notification service: deleted notification', { id });
        } catch (error) {
            logger.error('Notification service: failed to delete notification', {
                error: error instanceof Error ? error.message : String(error),
                id,
            });
            throw error;
        }
    }

    async cleanupOldNotifications(days = 30): Promise<number> {
        try {
            const count = await this.gateway.deleteOlderThan(days);
            logger.info('Notification service: cleaned up old notifications', { days, count });
            return count;
        } catch (error) {
            logger.error('Notification service: failed to cleanup old notifications', {
                error: error instanceof Error ? error.message : String(error),
                days,
            });
            throw error;
        }
    }
}
