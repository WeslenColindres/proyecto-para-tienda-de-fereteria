-- Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'info',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    read_at TIMESTAMP
);

-- Índices para mejorar performance
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON notifications(is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_priority ON notifications(priority);

-- Comentarios para documentación
COMMENT ON TABLE notifications IS 'Almacena todas las notificaciones del sistema';
COMMENT ON COLUMN notifications.type IS 'Tipo de notificación: sale, inventory, product, supplier, customer, system, alert';
COMMENT ON COLUMN notifications.priority IS 'Prioridad: info, warning, error, success';
COMMENT ON COLUMN notifications.metadata IS 'Datos adicionales en formato JSON';
