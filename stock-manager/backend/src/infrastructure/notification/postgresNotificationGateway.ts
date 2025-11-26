import { randomUUID } from 'crypto';
import { NotificationEntity } from '../../domain/notification/notification.entity';
import type { CreateNotificationDTO } from '../../domain/notification/notificationSchema';
import { query } from '../../infrastructure/database/postgres';
import { logger } from '../../infrastructure/logger';

export interface NotificationGateway {
    create(dto: CreateNotificationDTO): Promise<NotificationEntity>;
    findById(id: string): Promise<NotificationEntity | null>;
    findAll(limit?: number, offset?: number): Promise<NotificationEntity[]>;
    findUnread(): Promise<NotificationEntity[]>;
    markAsRead(id: string): Promise<void>;
    delete(id: string): Promise<void>;
    deleteOlderThan(days: number): Promise<number>;
}

export class PostgresNotificationGateway implements NotificationGateway {
    async create(dto: CreateNotificationDTO): Promise<NotificationEntity> {
        const id = randomUUID();
        const now = new Date();

        try {
            const result = await query<{
                id: string;
                title: string;
                message: string;
                type: string;
                priority: string;
                is_read: boolean;
                created_at: Date;
                read_at: Date | null;
                metadata: Record<string, unknown> | null;
            }>(
                `INSERT INTO notifications (id, title, message, type, priority, metadata, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
                [id, dto.title, dto.message, dto.type, dto.priority, JSON.stringify(dto.metadata || null), now],
            );

            logger.info('Notification created', { id, type: dto.type, priority: dto.priority });

            const row = result[0];
            return new NotificationEntity(
                row.id,
                row.title,
                row.message,
                row.type as any,
                row.priority as any,
                row.is_read,
                row.created_at,
                row.read_at,
                row.metadata || undefined,
            );
        } catch (error) {
            logger.error('Failed to create notification', {
                error: error instanceof Error ? error.message : String(error),
                dto,
            });
            throw error;
        }
    }

    async findById(id: string): Promise<NotificationEntity | null> {
        try {
            const result = await query<{
                id: string;
                title: string;
                message: string;
                type: string;
                priority: string;
                is_read: boolean;
                created_at: Date;
                read_at: Date | null;
                metadata: Record<string, unknown> | null;
            }>('SELECT * FROM notifications WHERE id = $1', [id]);

            if (result.length === 0) return null;

            const row = result[0];
            return new NotificationEntity(
                row.id,
                row.title,
                row.message,
                row.type as any,
                row.priority as any,
                row.is_read,
                row.created_at,
                row.read_at,
                row.metadata || undefined,
            );
        } catch (error) {
            logger.error('Failed to find notification by id', {
                error: error instanceof Error ? error.message : String(error),
                id,
            });
            throw error;
        }
    }

    async findAll(limit = 50, offset = 0): Promise<NotificationEntity[]> {
        try {
            const result = await query<{
                id: string;
                title: string;
                message: string;
                type: string;
                priority: string;
                is_read: boolean;
                created_at: Date;
                read_at: Date | null;
                metadata: Record<string, unknown> | null;
            }>('SELECT * FROM notifications ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);

            return result.map(
                (row) =>
                    new NotificationEntity(
                        row.id,
                        row.title,
                        row.message,
                        row.type as any,
                        row.priority as any,
                        row.is_read,
                        row.created_at,
                        row.read_at,
                        row.metadata || undefined,
                    ),
            );
        } catch (error) {
            logger.error('Failed to find all notifications', {
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    async findUnread(): Promise<NotificationEntity[]> {
        try {
            const result = await query<{
                id: string;
                title: string;
                message: string;
                type: string;
                priority: string;
                is_read: boolean;
                created_at: Date;
                read_at: Date | null;
                metadata: Record<string, unknown> | null;
            }>('SELECT * FROM notifications WHERE is_read = FALSE ORDER BY created_at DESC');

            return result.map(
                (row) =>
                    new NotificationEntity(
                        row.id,
                        row.title,
                        row.message,
                        row.type as any,
                        row.priority as any,
                        row.is_read,
                        row.created_at,
                        row.read_at,
                        row.metadata || undefined,
                    ),
            );
        } catch (error) {
            logger.error('Failed to find unread notifications', {
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    async markAsRead(id: string): Promise<void> {
        try {
            await query('UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = $1', [id]);
            logger.info('Notification marked as read', { id });
        } catch (error) {
            logger.error('Failed to mark notification as read', {
                error: error instanceof Error ? error.message : String(error),
                id,
            });
            throw error;
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await query('DELETE FROM notifications WHERE id = $1', [id]);
            logger.info('Notification deleted', { id });
        } catch (error) {
            logger.error('Failed to delete notification', {
                error: error instanceof Error ? error.message : String(error),
                id,
            });
            throw error;
        }
    }

    async deleteOlderThan(days: number): Promise<number> {
        try {
            const result = await query<{ count: number }>(
                'DELETE FROM notifications WHERE created_at < NOW() - INTERVAL \'$1 days\' RETURNING id',
                [days],
            );
            const count = result.length;
            logger.info('Deleted old notifications', { days, count });
            return count;
        } catch (error) {
            logger.error('Failed to delete old notifications', {
                error: error instanceof Error ? error.message : String(error),
                days,
            });
            throw error;
        }
    }
}
