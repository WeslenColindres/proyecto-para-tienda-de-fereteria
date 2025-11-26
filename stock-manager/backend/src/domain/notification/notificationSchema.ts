import { z } from 'zod';

// Enum de prioridades
export const NotificationPriorityEnum = z.enum(['info', 'warning', 'error', 'success']);
export type NotificationPriority = z.infer<typeof NotificationPriorityEnum>;

// Enum de tipos
export const NotificationTypeEnum = z.enum([
    'sale',
    'inventory',
    'product',
    'supplier',
    'customer',
    'system',
    'alert',
]);
export type NotificationType = z.infer<typeof NotificationTypeEnum>;

// Schema principal de notificación
export const NotificationSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    message: z.string().min(1, 'Message is required').max(1000, 'Message too long'),
    type: NotificationTypeEnum,
    priority: NotificationPriorityEnum,
    isRead: z.boolean().default(false),
    metadata: z.record(z.string(), z.unknown()).optional(),
    createdAt: z.date(),
    readAt: z.date().nullable().optional(),
});

export type Notification = z.infer<typeof NotificationSchema>;

// Schema para crear notificación (sin id, createdAt, etc.)
export const CreateNotificationSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    message: z.string().min(1, 'Message is required').max(1000, 'Message too long'),
    type: NotificationTypeEnum,
    priority: NotificationPriorityEnum.default('info'),
    metadata: z.record(z.string(), z.unknown()).optional(),
});

export type CreateNotificationDTO = z.infer<typeof CreateNotificationSchema>;

// Schema para actualizar notificación
export const UpdateNotificationSchema = z.object({
    isRead: z.boolean().optional(),
    readAt: z.date().nullable().optional(),
});

export type UpdateNotificationDTO = z.infer<typeof UpdateNotificationSchema>;
