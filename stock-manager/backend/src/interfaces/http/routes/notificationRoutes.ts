import { Router } from 'express';
import type { Request, Response } from 'express';
import { NotificationService } from '../../../application/notification/notificationService';
import { PostgresNotificationGateway } from '../../../infrastructure/notification/postgresNotificationGateway';
import { CreateNotificationSchema } from '../../../domain/notification/notificationSchema';
import { logger } from '../../../infrastructure/logger';

const router = Router();
const notificationGateway = new PostgresNotificationGateway();
const notificationService = new NotificationService(notificationGateway);

// GET /api/notifications - Obtener todas las notificaciones con paginación
router.get('/', async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 50;
        const offset = parseInt(req.query.offset as string) || 0;

        const notifications = await notificationService.getAllNotifications(limit, offset);

        res.json({
            success: true,
            data: notifications.map((n) => n.toJSON()),
            pagination: {
                limit,
                offset,
                count: notifications.length,
            },
        });
    } catch (error) {
        logger.error('Failed to get notifications', {
            error: error instanceof Error ? error.message : String(error),
        });
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve notifications',
        });
    }
});

// GET /api/notifications/unread - Obtener notificaciones no leídas
router.get('/unread', async (req: Request, res: Response) => {
    try {
        const notifications = await notificationService.getUnreadNotifications();

        res.json({
            success: true,
            data: notifications.map((n) => n.toJSON()),
            count: notifications.length,
        });
    } catch (error) {
        logger.error('Failed to get unread notifications', {
            error: error instanceof Error ? error.message : String(error),
        });
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve unread notifications',
        });
    }
});

// GET /api/notifications/:id - Obtener notificación por ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const notification = await notificationService.getNotificationById(id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                error: 'Notification not found',
            });
        }

        res.json({
            success: true,
            data: notification.toJSON(),
        });
    } catch (error) {
        logger.error('Failed to get notification by id', {
            error: error instanceof Error ? error.message : String(error),
            id: req.params.id,
        });
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve notification',
        });
    }
});

// POST /api/notifications - Crear nueva notificación
router.post('/', async (req: Request, res: Response) => {
    try {
        // Validar con Zod
        const validatedData = CreateNotificationSchema.parse(req.body);

        const notification = await notificationService.createNotification(validatedData);

        res.status(201).json({
            success: true,
            data: notification.toJSON(),
        });
    } catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            logger.warn('Invalid notification data', { error: error.message });
            return res.status(400).json({
                success: false,
                error: 'Invalid notification data',
                details: error.message,
            });
        }

        logger.error('Failed to create notification', {
            error: error instanceof Error ? error.message : String(error),
        });
        res.status(500).json({
            success: false,
            error: 'Failed to create notification',
        });
    }
});

// PATCH /api/notifications/:id/read - Marcar como leída
router.patch('/:id/read', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await notificationService.markAsRead(id);

        res.json({
            success: true,
            message: 'Notification marked as read',
        });
    } catch (error) {
        logger.error('Failed to mark notification as read', {
            error: error instanceof Error ? error.message : String(error),
            id: req.params.id,
        });
        res.status(500).json({
            success: false,
            error: 'Failed to mark notification as read',
        });
    }
});

// DELETE /api/notifications/:id - Eliminar notificación
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await notificationService.deleteNotification(id);

        res.json({
            success: true,
            message: 'Notification deleted',
        });
    } catch (error) {
        logger.error('Failed to delete notification', {
            error: error instanceof Error ? error.message : String(error),
            id: req.params.id,
        });
        res.status(500).json({
            success: false,
            error: 'Failed to delete notification',
        });
    }
});

export default router;
