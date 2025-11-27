-- =====================================================
-- MIGRACIÓN 013: GESTIÓN DE PRECIOS HISTÓRICOS Y LOTES
-- =====================================================
-- Sistema de precios históricos y control de lotes/vencimientos

-- =====================================================
-- MEJORAS A PRECIOS_PRODUCTO
-- =====================================================

-- Agregar campos de control a precios_producto
ALTER TABLE precios_producto ADD COLUMN IF NOT EXISTS version INT DEFAULT 1;
ALTER TABLE precios_producto ADD COLUMN IF NOT EXISTS motivo_cambio TEXT;
ALTER TABLE precios_producto ADD COLUMN IF NOT EXISTS id_usuario_modifica INT REFERENCES usuarios(id_usuario);
ALTER TABLE precios_producto ADD COLUMN IF NOT EXISTS precio_anterior DECIMAL(12,2);
ALTER TABLE precios_producto ADD COLUMN IF NOT EXISTS porcentaje_cambio DECIMAL(5,2);

-- Índice compuesto para consultas de precio vigente
CREATE INDEX IF NOT EXISTS idx_precios_producto_vigente ON precios_producto(id_producto, tipo_precio, fecha_vigencia_inicio DESC, activo) WHERE activo = TRUE;

COMMENT ON COLUMN precios_producto.version IS 'Versión del precio para control de cambios';
COMMENT ON COLUMN precios_producto.porcentaje_cambio IS 'Porcentaje de cambio respecto al precio anterior';

-- =====================================================
-- HISTORIAL DE PRECIOS EN VENTAS
-- =====================================================

CREATE TABLE IF NOT EXISTS historial_precios_ventas (
    id_historial_precio SERIAL PRIMARY KEY,
    id_detalle_venta INT REFERENCES detalle_ventas(id_detalle_venta) ON DELETE CASCADE,
    id_producto INT REFERENCES productos(id_producto),
    
    -- Precio al Momento de la Venta
    tipo_precio VARCHAR(20) NOT NULL,
    precio_unitario DECIMAL(12,2) NOT NULL,
    precio_lista DECIMAL(12,2),
    descuento_aplicado DECIMAL(12,2) DEFAULT 0,
    
    -- Referencia al Precio Vigente
    id_precio_vigente INT REFERENCES precios_producto(id_precio),
    version_precio INT,
    
    -- Metadata
    fecha_venta TIMESTAMP NOT NULL,
    moneda VARCHAR(3) DEFAULT 'GTQ',
    tipo_cambio DECIMAL(10,4) DEFAULT 1.0000,
    
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_historial_precios_detalle ON historial_precios_ventas(id_detalle_venta);
CREATE INDEX idx_historial_precios_producto ON historial_precios_ventas(id_producto);
CREATE INDEX idx_historial_precios_fecha ON historial_precios_ventas(fecha_venta);

COMMENT ON TABLE historial_precios_ventas IS 'Almacena el precio exacto al momento de cada venta para integridad histórica';

-- =====================================================
-- LOTES DE PRODUCTO
-- =====================================================

CREATE TABLE IF NOT EXISTS lotes_producto (
    id_lote SERIAL PRIMARY KEY,
    id_producto INT REFERENCES productos(id_producto),
    numero_lote VARCHAR(50) NOT NULL,
    
    -- Fechas
    fecha_fabricacion DATE,
    fecha_vencimiento DATE,
    fecha_ingreso DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Proveedor
    id_proveedor INT REFERENCES proveedores(id_proveedor),
    id_orden_compra INT REFERENCES ordenes_compra(id_orden_compra),
    
    -- Cantidades
    cantidad_inicial DECIMAL(10,2) NOT NULL,
    cantidad_disponible DECIMAL(10,2) NOT NULL,
    cantidad_reservada DECIMAL(10,2) DEFAULT 0,
    
    -- Costos
    costo_unitario DECIMAL(12,2),
    costo_total DECIMAL(14,2),
    
    -- Ubicación
    id_sucursal INT REFERENCES sucursales(id_sucursal),
    ubicacion_fisica VARCHAR(100),
    
    -- Estado
    estado VARCHAR(20) DEFAULT 'DISPONIBLE' CHECK (estado IN ('DISPONIBLE', 'RESERVADO', 'VENCIDO', 'CUARENTENA', 'RETIRADO')),
    motivo_retiro TEXT,
    fecha_retiro DATE,
    
    -- Control de Calidad
    requiere_inspeccion BOOLEAN DEFAULT FALSE,
    inspeccionado BOOLEAN DEFAULT FALSE,
    fecha_inspeccion DATE,
    resultado_inspeccion TEXT,
    
    -- Metadata
    observaciones TEXT,
    datos_adicionales JSONB,
    
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(id_producto, numero_lote)
);

CREATE INDEX idx_lotes_producto ON lotes_producto(id_producto);
CREATE INDEX idx_lotes_numero ON lotes_producto(numero_lote);
CREATE INDEX idx_lotes_vencimiento ON lotes_producto(fecha_vencimiento);
CREATE INDEX idx_lotes_estado ON lotes_producto(estado);
CREATE INDEX idx_lotes_sucursal ON lotes_producto(id_sucursal);
CREATE INDEX idx_lotes_proveedor ON lotes_producto(id_proveedor);

COMMENT ON TABLE lotes_producto IS 'Control de lotes por producto con fechas de vencimiento';

-- =====================================================
-- MEJORAS A KARDEX_INVENTARIO
-- =====================================================

-- Agregar campos de control de salidas
ALTER TABLE kardex_inventario ADD COLUMN IF NOT EXISTS id_lote INT REFERENCES lotes_producto(id_lote);
ALTER TABLE kardex_inventario ADD COLUMN IF NOT EXISTS lote_numero VARCHAR(50);
ALTER TABLE kardex_inventario ADD COLUMN IF NOT EXISTS fecha_vencimiento DATE;
ALTER TABLE kardex_inventario ADD COLUMN IF NOT EXISTS ubicacion_origen VARCHAR(100);
ALTER TABLE kardex_inventario ADD COLUMN IF NOT EXISTS ubicacion_destino VARCHAR(100);
ALTER TABLE kardex_inventario ADD COLUMN IF NOT EXISTS id_responsable_entrega INT REFERENCES trabajadores(id_trabajador);
ALTER TABLE kardex_inventario ADD COLUMN IF NOT EXISTS id_responsable_recibe INT REFERENCES trabajadores(id_trabajador);
ALTER TABLE kardex_inventario ADD COLUMN IF NOT EXISTS observaciones_movimiento TEXT;
ALTER TABLE kardex_inventario ADD COLUMN IF NOT EXISTS requiere_autorizacion BOOLEAN DEFAULT FALSE;
ALTER TABLE kardex_inventario ADD COLUMN IF NOT EXISTS id_usuario_autoriza INT REFERENCES usuarios(id_usuario);
ALTER TABLE kardex_inventario ADD COLUMN IF NOT EXISTS fecha_autorizacion TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_kardex_lote ON kardex_inventario(id_lote);
CREATE INDEX IF NOT EXISTS idx_kardex_responsable_entrega ON kardex_inventario(id_responsable_entrega);
CREATE INDEX IF NOT EXISTS idx_kardex_responsable_recibe ON kardex_inventario(id_responsable_recibe);

COMMENT ON COLUMN kardex_inventario.id_lote IS 'Referencia al lote específico del movimiento';
COMMENT ON COLUMN kardex_inventario.ubicacion_origen IS 'Ubicación física de origen (ej: ESTANTE-A-01)';
COMMENT ON COLUMN kardex_inventario.ubicacion_destino IS 'Ubicación física de destino';

-- =====================================================
-- SALIDAS ESPECIALES
-- =====================================================

CREATE TABLE IF NOT EXISTS salidas_especiales (
    id_salida_especial SERIAL PRIMARY KEY,
    numero_salida VARCHAR(50) UNIQUE NOT NULL,
    tipo_salida VARCHAR(30) NOT NULL CHECK (tipo_salida IN ('DONACION', 'MUESTRA', 'GARANTIA', 'DESTRUCCION', 'MERMA', 'TRANSFERENCIA_INTERNA', 'USO_INTERNO', 'OTRO')),
    
    -- Datos Generales
    fecha_salida DATE NOT NULL DEFAULT CURRENT_DATE,
    id_sucursal INT REFERENCES sucursales(id_sucursal),
    
    -- Destino/Beneficiario
    destinatario VARCHAR(150),
    nit_destinatario VARCHAR(20),
    direccion_destino TEXT,
    
    -- Autorización
    requiere_autorizacion BOOLEAN DEFAULT TRUE,
    id_usuario_solicita INT REFERENCES usuarios(id_usuario),
    id_usuario_autoriza INT REFERENCES usuarios(id_usuario),
    fecha_autorizacion TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'SOLICITADA' CHECK (estado IN ('SOLICITADA', 'AUTORIZADA', 'RECHAZADA', 'PROCESADA', 'ANULADA')),
    
    -- Justificación
    motivo TEXT NOT NULL,
    justificacion_detallada TEXT,
    
    -- Documentación
    numero_documento_respaldo VARCHAR(50),
    tipo_documento_respaldo VARCHAR(50),
    url_documento_respaldo TEXT,
    
    -- Responsables
    id_responsable_entrega INT REFERENCES trabajadores(id_trabajador),
    id_responsable_recibe INT REFERENCES trabajadores(id_trabajador),
    
    -- Totales
    total_items INT DEFAULT 0,
    valor_total DECIMAL(14,2) DEFAULT 0,
    
    -- Metadata
    observaciones TEXT,
    datos_adicionales JSONB,
    
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_salidas_especiales_tipo ON salidas_especiales(tipo_salida);
CREATE INDEX idx_salidas_especiales_fecha ON salidas_especiales(fecha_salida);
CREATE INDEX idx_salidas_especiales_estado ON salidas_especiales(estado);
CREATE INDEX idx_salidas_especiales_sucursal ON salidas_especiales(id_sucursal);

COMMENT ON TABLE salidas_especiales IS 'Salidas de inventario no relacionadas a ventas';

-- =====================================================
-- DETALLE DE SALIDAS ESPECIALES
-- =====================================================

CREATE TABLE IF NOT EXISTS detalle_salidas_especiales (
    id_detalle_salida SERIAL PRIMARY KEY,
    id_salida_especial INT REFERENCES salidas_especiales(id_salida_especial) ON DELETE CASCADE,
    numero_linea INT NOT NULL,
    
    -- Producto
    id_producto INT REFERENCES productos(id_producto),
    id_lote INT REFERENCES lotes_producto(id_lote),
    descripcion VARCHAR(250) NOT NULL,
    
    -- Cantidades
    cantidad DECIMAL(10,2) NOT NULL,
    id_unidad_medida INT REFERENCES unidades_medida(id_unidad),
    
    -- Valorización
    costo_unitario DECIMAL(12,2),
    costo_total DECIMAL(14,2),
    
    -- Ubicación
    ubicacion_origen VARCHAR(100),
    
    -- Metadata
    observaciones TEXT,
    
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_salida_especial, numero_linea)
);

CREATE INDEX idx_detalle_salidas_salida ON detalle_salidas_especiales(id_salida_especial);
CREATE INDEX idx_detalle_salidas_producto ON detalle_salidas_especiales(id_producto);
CREATE INDEX idx_detalle_salidas_lote ON detalle_salidas_especiales(id_lote);

-- =====================================================
-- ALERTAS DE VENCIMIENTO
-- =====================================================

CREATE TABLE IF NOT EXISTS alertas_vencimiento (
    id_alerta SERIAL PRIMARY KEY,
    id_lote INT REFERENCES lotes_producto(id_lote),
    id_producto INT REFERENCES productos(id_producto),
    
    -- Alerta
    tipo_alerta VARCHAR(30) CHECK (tipo_alerta IN ('PROXIMO_VENCER', 'VENCIDO', 'VENCIMIENTO_CRITICO')),
    dias_para_vencer INT,
    fecha_vencimiento DATE NOT NULL,
    
    -- Estado
    estado VARCHAR(20) DEFAULT 'ACTIVA' CHECK (estado IN ('ACTIVA', 'NOTIFICADA', 'RESUELTA', 'IGNORADA')),
    fecha_notificacion TIMESTAMP,
    fecha_resolucion TIMESTAMP,
    accion_tomada TEXT,
    
    -- Notificaciones
    notificado BOOLEAN DEFAULT FALSE,
    usuarios_notificados INT[],
    
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alertas_lote ON alertas_vencimiento(id_lote);
CREATE INDEX idx_alertas_producto ON alertas_vencimiento(id_producto);
CREATE INDEX idx_alertas_estado ON alertas_vencimiento(estado);
CREATE INDEX idx_alertas_fecha_venc ON alertas_vencimiento(fecha_vencimiento);

COMMENT ON TABLE alertas_vencimiento IS 'Alertas automáticas de productos próximos a vencer';

-- =====================================================
-- FUNCIÓN PARA GENERAR ALERTAS DE VENCIMIENTO
-- =====================================================

CREATE OR REPLACE FUNCTION generar_alertas_vencimiento()
RETURNS void AS $$
DECLARE
    lote RECORD;
    dias_alerta INT;
    tipo VARCHAR(30);
BEGIN
    FOR lote IN 
        SELECT l.*, p.nombre as producto_nombre
        FROM lotes_producto l
        JOIN productos p ON l.id_producto = p.id_producto
        WHERE l.estado = 'DISPONIBLE' 
        AND l.fecha_vencimiento IS NOT NULL
        AND l.cantidad_disponible > 0
    LOOP
        dias_alerta := lote.fecha_vencimiento - CURRENT_DATE;
        
        IF dias_alerta < 0 THEN
            tipo := 'VENCIDO';
        ELSIF dias_alerta <= 7 THEN
            tipo := 'VENCIMIENTO_CRITICO';
        ELSIF dias_alerta <= 30 THEN
            tipo := 'PROXIMO_VENCER';
        ELSE
            CONTINUE;
        END IF;
        
        INSERT INTO alertas_vencimiento (id_lote, id_producto, tipo_alerta, dias_para_vencer, fecha_vencimiento)
        VALUES (lote.id_lote, lote.id_producto, tipo, dias_alerta, lote.fecha_vencimiento)
        ON CONFLICT DO NOTHING;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generar_alertas_vencimiento IS 'Genera alertas automáticas para productos próximos a vencer';

-- =====================================================
-- TRIGGER PARA REGISTRAR PRECIO EN VENTA
-- =====================================================

CREATE OR REPLACE FUNCTION registrar_precio_venta()
RETURNS TRIGGER AS $$
DECLARE
    precio_vigente RECORD;
BEGIN
    -- Buscar el precio vigente al momento de la venta
    SELECT * INTO precio_vigente
    FROM precios_producto
    WHERE id_producto = NEW.id_producto
    AND tipo_precio = 'PÚBLICO'  -- O el tipo que corresponda
    AND fecha_vigencia_inicio <= CURRENT_DATE
    AND (fecha_vigencia_fin IS NULL OR fecha_vigencia_fin >= CURRENT_DATE)
    AND activo = TRUE
    ORDER BY fecha_vigencia_inicio DESC
    LIMIT 1;
    
    -- Registrar en historial
    IF FOUND THEN
        INSERT INTO historial_precios_ventas (
            id_detalle_venta,
            id_producto,
            tipo_precio,
            precio_unitario,
            precio_lista,
            descuento_aplicado,
            id_precio_vigente,
            version_precio,
            fecha_venta
        ) VALUES (
            NEW.id_detalle_venta,
            NEW.id_producto,
            'PÚBLICO',
            NEW.precio_unitario,
            precio_vigente.precio,
            NEW.descuento_monto,
            precio_vigente.id_precio,
            precio_vigente.version,
            CURRENT_TIMESTAMP
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_registrar_precio_venta ON detalle_ventas;
CREATE TRIGGER trigger_registrar_precio_venta
AFTER INSERT ON detalle_ventas
FOR EACH ROW EXECUTE FUNCTION registrar_precio_venta();

COMMENT ON FUNCTION registrar_precio_venta IS 'Registra automáticamente el precio vigente al momento de cada venta';

-- =====================================================
-- VISTA: PRODUCTOS PRÓXIMOS A VENCER
-- =====================================================

CREATE OR REPLACE VIEW vista_productos_proximos_vencer AS
SELECT 
    l.id_lote,
    l.numero_lote,
    p.sku,
    p.nombre AS producto,
    l.cantidad_disponible,
    l.fecha_vencimiento,
    l.fecha_vencimiento - CURRENT_DATE AS dias_para_vencer,
    CASE 
        WHEN l.fecha_vencimiento < CURRENT_DATE THEN 'VENCIDO'
        WHEN l.fecha_vencimiento - CURRENT_DATE <= 7 THEN 'CRÍTICO'
        WHEN l.fecha_vencimiento - CURRENT_DATE <= 30 THEN 'ALERTA'
        ELSE 'NORMAL'
    END AS estado_vencimiento,
    s.nombre AS sucursal,
    l.ubicacion_fisica,
    l.costo_unitario,
    l.cantidad_disponible * l.costo_unitario AS valor_total
FROM lotes_producto l
JOIN productos p ON l.id_producto = p.id_producto
LEFT JOIN sucursales s ON l.id_sucursal = s.id_sucursal
WHERE l.estado = 'DISPONIBLE'
AND l.fecha_vencimiento IS NOT NULL
AND l.cantidad_disponible > 0
ORDER BY l.fecha_vencimiento ASC;

COMMENT ON VIEW vista_productos_proximos_vencer IS 'Vista de productos próximos a vencer con alertas';
