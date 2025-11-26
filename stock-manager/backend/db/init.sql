-- =====================================================
-- SISTEMA ERP CON FEL GUATEMALA
-- Normalizado hasta 5FN con Auditoria Completa
-- =====================================================

-- =====================================================
-- MODULO DE SEGURIDAD Y USUARIOS
-- =====================================================

CREATE TABLE roles (
    id_rol SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    nombre_completo VARCHAR(150) NOT NULL,
    id_rol INT NOT NULL REFERENCES roles(id_rol),
    activo BOOLEAN DEFAULT TRUE,
    ultimo_acceso TIMESTAMP,
    intentos_fallidos INT DEFAULT 0,
    bloqueado_hasta TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permisos (
    id_permiso SERIAL PRIMARY KEY,
    modulo VARCHAR(50) NOT NULL,
    accion VARCHAR(50) NOT NULL,
    descripcion TEXT,
    UNIQUE(modulo, accion)
);

CREATE TABLE roles_permisos (
    id_rol INT REFERENCES roles(id_rol) ON DELETE CASCADE,
    id_permiso INT REFERENCES permisos(id_permiso) ON DELETE CASCADE,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_rol, id_permiso)
);

CREATE TABLE sesiones (
    id_sesion UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario INT REFERENCES usuarios(id_usuario),
    token_sesion VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP NOT NULL,
    activa BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- MODULO DE CONFIGURACION EMPRESARIAL
-- =====================================================

CREATE TABLE empresa (
    id_empresa SERIAL PRIMARY KEY,
    nombre_comercial VARCHAR(150) NOT NULL,
    razon_social VARCHAR(150) NOT NULL,
    nit VARCHAR(20) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100),
    sitio_web VARCHAR(100),
    logo_url TEXT,
    fecha_constitucion DATE,
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sucursales (
    id_sucursal SERIAL PRIMARY KEY,
    id_empresa INT REFERENCES empresa(id_empresa),
    codigo_sucursal VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    direccion TEXT NOT NULL,
    departamento VARCHAR(50),
    municipio VARCHAR(50),
    telefono VARCHAR(20),
    email VARCHAR(100),
    es_matriz BOOLEAN DEFAULT FALSE,
    activa BOOLEAN DEFAULT TRUE,
    fecha_apertura DATE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE configuracion_fel (
    id_config_fel SERIAL PRIMARY KEY,
    id_sucursal INT REFERENCES sucursales(id_sucursal),
    proveedor_certificador VARCHAR(50) NOT NULL,
    nit_certificador VARCHAR(20),
    usuario_certificador VARCHAR(100),
    token_autenticacion TEXT NOT NULL,
    url_endpoint TEXT NOT NULL,
    url_backup TEXT,
    tipo_ambiente VARCHAR(20) DEFAULT 'PRODUCCION',
    afiliacion_iva VARCHAR(20) NOT NULL,
    establecimiento INT NOT NULL,
    activa BOOLEAN DEFAULT TRUE,
    fecha_activacion TIMESTAMP,
    fecha_vencimiento TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_sucursal, proveedor_certificador)
);

-- =====================================================
-- MODULO DE CLIENTES
-- =====================================================

CREATE TABLE tipos_cliente (
    id_tipo_cliente SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descuento_predeterminado DECIMAL(5,2) DEFAULT 0.00,
    descripcion TEXT
);

CREATE TABLE clientes (
    id_cliente SERIAL PRIMARY KEY,
    nit VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    nombre_comercial VARCHAR(150),
    id_tipo_cliente INT REFERENCES tipos_cliente(id_tipo_cliente),
    email VARCHAR(100),
    telefono VARCHAR(20),
    fecha_nacimiento DATE,
    limite_credito DECIMAL(12,2) DEFAULT 0.00,
    dias_credito INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_ultima_compra TIMESTAMP
);

CREATE TABLE direcciones_cliente (
    id_direccion SERIAL PRIMARY KEY,
    id_cliente INT REFERENCES clientes(id_cliente) ON DELETE CASCADE,
    tipo_direccion VARCHAR(20),
    direccion TEXT NOT NULL,
    departamento VARCHAR(50),
    municipio VARCHAR(50),
    zona VARCHAR(10),
    referencia TEXT,
    predeterminada BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contactos_cliente (
    id_contacto SERIAL PRIMARY KEY,
    id_cliente INT REFERENCES clientes(id_cliente) ON DELETE CASCADE,
    nombre_contacto VARCHAR(100) NOT NULL,
    cargo VARCHAR(50),
    email VARCHAR(100),
    telefono VARCHAR(20),
    tipo_contacto VARCHAR(20),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MODULO DE PROVEEDORES
-- =====================================================

CREATE TABLE proveedores (
    id_proveedor SERIAL PRIMARY KEY,
    nit VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    nombre_comercial VARCHAR(150),
    email VARCHAR(100),
    telefono VARCHAR(20),
    direccion TEXT,
    dias_entrega INT DEFAULT 0,
    calificacion DECIMAL(3,2),
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contactos_proveedor (
    id_contacto SERIAL PRIMARY KEY,
    id_proveedor INT REFERENCES proveedores(id_proveedor) ON DELETE CASCADE,
    nombre_contacto VARCHAR(100) NOT NULL,
    cargo VARCHAR(50),
    email VARCHAR(100),
    telefono VARCHAR(20),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MODULO DE PRODUCTOS E INVENTARIO
-- =====================================================

CREATE TABLE categorias (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    categoria_padre INT REFERENCES categorias(id_categoria),
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE unidades_medida (
    id_unidad SERIAL PRIMARY KEY,
    codigo VARCHAR(10) UNIQUE NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT
);

CREATE TABLE productos (
    id_producto SERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    codigo_barras VARCHAR(50) UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    id_categoria INT REFERENCES categorias(id_categoria),
    id_unidad_medida INT REFERENCES unidades_medida(id_unidad),
    id_proveedor_principal INT REFERENCES proveedores(id_proveedor),
    es_inventariable BOOLEAN DEFAULT TRUE,
    es_vendible BOOLEAN DEFAULT TRUE,
    es_comprable BOOLEAN DEFAULT TRUE,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE precios_producto (
    id_precio SERIAL PRIMARY KEY,
    id_producto INT REFERENCES productos(id_producto) ON DELETE CASCADE,
    tipo_precio VARCHAR(20) NOT NULL,
    precio DECIMAL(12,2) NOT NULL,
    moneda VARCHAR(3) DEFAULT 'GTQ',
    fecha_vigencia_inicio DATE NOT NULL,
    fecha_vigencia_fin DATE,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_producto, tipo_precio, fecha_vigencia_inicio)
);

CREATE TABLE configuracion_inventario (
    id_config SERIAL PRIMARY KEY,
    id_producto INT REFERENCES productos(id_producto) ON DELETE CASCADE,
    id_sucursal INT REFERENCES sucursales(id_sucursal),
    punto_reorden INT DEFAULT 5,
    stock_minimo INT DEFAULT 0,
    stock_maximo INT DEFAULT 0,
    ubicacion_fisica VARCHAR(50),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_producto, id_sucursal)
);

CREATE TABLE stock_producto (
    id_stock SERIAL PRIMARY KEY,
    id_producto INT REFERENCES productos(id_producto),
    id_sucursal INT REFERENCES sucursales(id_sucursal),
    cantidad_disponible DECIMAL(10,2) DEFAULT 0,
    cantidad_reservada DECIMAL(10,2) DEFAULT 0,
    cantidad_transito DECIMAL(10,2) DEFAULT 0,
    fecha_ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_producto, id_sucursal)
);

-- =====================================================
-- MODULO DE IMPUESTOS
-- =====================================================

CREATE TABLE tipos_impuesto (
    id_tipo_impuesto SERIAL PRIMARY KEY,
    codigo VARCHAR(10) UNIQUE NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    porcentaje DECIMAL(5,2) NOT NULL,
    aplica_sobre VARCHAR(20) DEFAULT 'SUBTOTAL',
    activo BOOLEAN DEFAULT TRUE,
    fecha_vigencia_inicio DATE NOT NULL,
    fecha_vigencia_fin DATE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE productos_impuestos (
    id_producto INT REFERENCES productos(id_producto) ON DELETE CASCADE,
    id_tipo_impuesto INT REFERENCES tipos_impuesto(id_tipo_impuesto),
    exento BOOLEAN DEFAULT FALSE,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_producto, id_tipo_impuesto)
);

-- =====================================================
-- MODULO DE VENTAS (COMPLETO)
-- =====================================================

CREATE TABLE formas_pago (
    id_forma_pago SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    requiere_autorizacion BOOLEAN DEFAULT FALSE,
    dias_acreditacion INT DEFAULT 0,
    activa BOOLEAN DEFAULT TRUE
);

CREATE TABLE series_documentos (
    id_serie SERIAL PRIMARY KEY,
    id_sucursal INT REFERENCES sucursales(id_sucursal),
    tipo_documento VARCHAR(20) NOT NULL,
    serie VARCHAR(10) NOT NULL,
    correlativo_actual BIGINT DEFAULT 0,
    correlativo_inicio BIGINT NOT NULL,
    correlativo_fin BIGINT NOT NULL,
    fecha_autorizacion DATE,
    fecha_vencimiento DATE,
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_sucursal, tipo_documento, serie)
);

CREATE TABLE ventas (
    id_venta SERIAL PRIMARY KEY,
    uuid_interno UUID UNIQUE DEFAULT gen_random_uuid(),
    id_sucursal INT REFERENCES sucursales(id_sucursal),
    id_serie INT REFERENCES series_documentos(id_serie),
    numero_documento VARCHAR(50) UNIQUE NOT NULL,
    tipo_documento VARCHAR(20) NOT NULL,
    id_cliente INT REFERENCES clientes(id_cliente),
    id_direccion_envio INT REFERENCES direcciones_cliente(id_direccion),
    id_usuario_vendedor INT REFERENCES usuarios(id_usuario),
    uuid_sat VARCHAR(100) UNIQUE,
    numero_autorizacion_sat VARCHAR(100),
    serie_sat VARCHAR(20),
    numero_sat BIGINT,
    fecha_certificacion TIMESTAMP,
    subtotal DECIMAL(12,2) NOT NULL,
    total_descuentos DECIMAL(12,2) DEFAULT 0.00,
    total_impuestos DECIMAL(12,2) DEFAULT 0.00,
    total_final DECIMAL(12,2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'BORRADOR',
    requiere_certificacion BOOLEAN DEFAULT FALSE,
    intentos_certificacion INT DEFAULT 0,
    error_certificacion TEXT,
    observaciones TEXT,
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_vencimiento DATE,
    fecha_anulacion TIMESTAMP,
    motivo_anulacion TEXT,
    id_usuario_anula INT REFERENCES usuarios(id_usuario),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE detalle_ventas (
    id_detalle_venta SERIAL PRIMARY KEY,
    id_venta INT REFERENCES ventas(id_venta) ON DELETE CASCADE,
    numero_linea INT NOT NULL,
    id_producto INT REFERENCES productos(id_producto),
    descripcion VARCHAR(250) NOT NULL,
    cantidad DECIMAL(10,2) NOT NULL,
    precio_unitario DECIMAL(12,2) NOT NULL,
    descuento_porcentaje DECIMAL(5,2) DEFAULT 0.00,
    descuento_monto DECIMAL(12,2) DEFAULT 0.00,
    subtotal_linea DECIMAL(12,2) NOT NULL,
    total_impuestos_linea DECIMAL(12,2) DEFAULT 0.00,
    total_linea DECIMAL(12,2) NOT NULL,
    costo_unitario_momento DECIMAL(12,2),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_venta, numero_linea)
);

CREATE TABLE detalle_ventas_impuestos (
    id_detalle_venta INT REFERENCES detalle_ventas(id_detalle_venta) ON DELETE CASCADE,
    id_tipo_impuesto INT REFERENCES tipos_impuesto(id_tipo_impuesto),
    monto_impuesto DECIMAL(12,2) NOT NULL,
    PRIMARY KEY (id_detalle_venta, id_tipo_impuesto)
);

CREATE TABLE pagos_venta (
    id_pago SERIAL PRIMARY KEY,
    id_venta INT REFERENCES ventas(id_venta) ON DELETE CASCADE,
    id_forma_pago INT REFERENCES formas_pago(id_forma_pago),
    monto DECIMAL(12,2) NOT NULL,
    numero_autorizacion VARCHAR(100),
    numero_referencia VARCHAR(100),
    banco VARCHAR(50),
    numero_cheque VARCHAR(50),
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'PENDIENTE',
    fecha_acreditacion TIMESTAMP,
    observaciones TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MODULO DE COMPRAS
-- =====================================================

CREATE TABLE ordenes_compra (
    id_orden_compra SERIAL PRIMARY KEY,
    numero_orden VARCHAR(50) UNIQUE NOT NULL,
    id_proveedor INT REFERENCES proveedores(id_proveedor),
    id_sucursal INT REFERENCES sucursales(id_sucursal),
    id_usuario_solicitante INT REFERENCES usuarios(id_usuario),
    fecha_orden DATE NOT NULL,
    fecha_entrega_esperada DATE,
    subtotal DECIMAL(12,2) NOT NULL,
    total_impuestos DECIMAL(12,2) DEFAULT 0.00,
    total DECIMAL(12,2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'PENDIENTE',
    observaciones TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE detalle_orden_compra (
    id_detalle_orden SERIAL PRIMARY KEY,
    id_orden_compra INT REFERENCES ordenes_compra(id_orden_compra) ON DELETE CASCADE,
    numero_linea INT NOT NULL,
    id_producto INT REFERENCES productos(id_producto),
    cantidad DECIMAL(10,2) NOT NULL,
    precio_unitario DECIMAL(12,2) NOT NULL,
    total_linea DECIMAL(12,2) NOT NULL,
    cantidad_recibida DECIMAL(10,2) DEFAULT 0,
    UNIQUE(id_orden_compra, numero_linea)
);

-- =====================================================
-- KARDEX Y MOVIMIENTOS DE INVENTARIO
-- =====================================================

CREATE TABLE tipos_movimiento (
    id_tipo_movimiento SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    afecta_stock VARCHAR(10) NOT NULL,
    requiere_autorizacion BOOLEAN DEFAULT FALSE,
    modulo_origen VARCHAR(30),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE kardex_inventario (
    id_movimiento SERIAL PRIMARY KEY,
    id_producto INT REFERENCES productos(id_producto),
    id_sucursal INT REFERENCES sucursales(id_sucursal),
    id_tipo_movimiento INT REFERENCES tipos_movimiento(id_tipo_movimiento),
    documento_origen VARCHAR(30),
    id_documento_origen INT,
    numero_documento VARCHAR(50),
    cantidad DECIMAL(10,2) NOT NULL,
    costo_unitario DECIMAL(12,2),
    costo_total DECIMAL(12,2),
    stock_anterior DECIMAL(10,2) NOT NULL,
    stock_nuevo DECIMAL(10,2) NOT NULL,
    id_usuario INT REFERENCES usuarios(id_usuario),
    motivo TEXT,
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_origen INET,
    datos_adicionales JSONB
);

-- =====================================================
-- MODULO DE AUDITORIA COMPLETA
-- =====================================================

CREATE TABLE auditoria_general (
    id_auditoria BIGSERIAL PRIMARY KEY,
    tabla_afectada VARCHAR(50) NOT NULL,
    id_registro_afectado INT NOT NULL,
    operacion VARCHAR(10) NOT NULL,
    id_usuario INT REFERENCES usuarios(id_usuario),
    ip_address INET,
    user_agent TEXT,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    campos_modificados TEXT[],
    fecha_operacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modulo VARCHAR(50),
    accion_descripcion TEXT,
    CONSTRAINT idx_auditoria_tabla_registro CHECK (tabla_afectada IS NOT NULL AND id_registro_afectado IS NOT NULL)
);

CREATE TABLE auditoria_accesos (
    id_acceso BIGSERIAL PRIMARY KEY,
    id_usuario INT REFERENCES usuarios(id_usuario),
    tipo_evento VARCHAR(30) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    exitoso BOOLEAN NOT NULL,
    motivo_fallo TEXT,
    fecha_evento TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE auditoria_documentos_fel (
    id_auditoria_fel SERIAL PRIMARY KEY,
    id_venta INT REFERENCES ventas(id_venta),
    tipo_operacion VARCHAR(30),
    request_json JSONB,
    response_json JSONB,
    codigo_respuesta VARCHAR(20),
    mensaje_respuesta TEXT,
    exitoso BOOLEAN,
    tiempo_respuesta_ms INT,
    fecha_operacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDICES PARA OPTIMIZACION
-- =====================================================

CREATE INDEX idx_ventas_cliente ON ventas(id_cliente);
CREATE INDEX idx_ventas_fecha ON ventas(fecha_venta);
CREATE INDEX idx_ventas_estado ON ventas(estado);
CREATE INDEX idx_ventas_uuid_sat ON ventas(uuid_sat);
CREATE INDEX idx_detalle_ventas_producto ON detalle_ventas(id_producto);
CREATE INDEX idx_kardex_producto ON kardex_inventario(id_producto);
CREATE INDEX idx_kardex_fecha ON kardex_inventario(fecha_movimiento);
CREATE INDEX idx_kardex_sucursal ON kardex_inventario(id_sucursal);
CREATE INDEX idx_stock_producto_sucursal ON stock_producto(id_producto, id_sucursal);
CREATE INDEX idx_productos_sku ON productos(sku);
CREATE INDEX idx_productos_codigo_barras ON productos(codigo_barras);
CREATE INDEX idx_auditoria_tabla_id ON auditoria_general(tabla_afectada, id_registro_afectado);
CREATE INDEX idx_auditoria_fecha ON auditoria_general(fecha_operacion);
CREATE INDEX idx_auditoria_usuario ON auditoria_general(id_usuario);

-- =====================================================
-- TRIGGERS PARA AUDITORIA AUTOMATICA
-- =====================================================

CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO auditoria_general (
            tabla_afectada,
            id_registro_afectado,
            operacion,
            datos_anteriores,
            id_usuario,
            fecha_operacion
        ) VALUES (
            TG_TABLE_NAME,
            OLD.id_producto,
            'DELETE',
            row_to_json(OLD),
            current_setting('app.user_id', true)::INT,
            CURRENT_TIMESTAMP
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO auditoria_general (
            tabla_afectada,
            id_registro_afectado,
            operacion,
            datos_anteriores,
            datos_nuevos,
            id_usuario,
            fecha_operacion
        ) VALUES (
            TG_TABLE_NAME,
            NEW.id_producto,
            'UPDATE',
            row_to_json(OLD),
            row_to_json(NEW),
            current_setting('app.user_id', true)::INT,
            CURRENT_TIMESTAMP
        );
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO auditoria_general (
            tabla_afectada,
            id_registro_afectado,
            operacion,
            datos_nuevos,
            id_usuario,
            fecha_operacion
        ) VALUES (
            TG_TABLE_NAME,
            NEW.id_producto,
            'INSERT',
            row_to_json(NEW),
            current_setting('app.user_id', true)::INT,
            CURRENT_TIMESTAMP
        );
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_productos
AFTER INSERT OR UPDATE OR DELETE ON productos
FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_precios
AFTER INSERT OR UPDATE OR DELETE ON precios_producto
FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =====================================================
-- VISTAS PARA REPORTERIA
-- =====================================================

CREATE OR REPLACE VIEW vista_stock_consolidado AS
SELECT 
    p.id_producto,
    p.sku,
    p.nombre,
    sp.id_sucursal,
    su.nombre AS nombre_sucursal,
    sp.cantidad_disponible,
    sp.cantidad_reservada,
    ci.punto_reorden,
    ci.stock_minimo,
    CASE 
        WHEN sp.cantidad_disponible <= ci.punto_reorden THEN 'ALERTA'
        WHEN sp.cantidad_disponible <= ci.stock_minimo THEN 'CRITICO'
        ELSE 'NORMAL'
    END AS estado_stock
FROM productos p
LEFT JOIN stock_producto sp ON p.id_producto = sp.id_producto
LEFT JOIN sucursales su ON sp.id_sucursal = su.id_sucursal
LEFT JOIN configuracion_inventario ci ON p.id_producto = ci.id_producto 
    AND sp.id_sucursal = ci.id_sucursal
WHERE p.activo = TRUE AND p.es_inventariable = TRUE;

CREATE VIEW vista_ventas_rentabilidad AS
SELECT 
    v.id_venta,
    v.numero_documento,
    v.fecha_venta,
    c.nombre AS cliente,
    v.total_final,
    SUM(dv.cantidad * dv.costo_unitario_momento) AS costo_total,
    v.total_final - SUM(dv.cantidad * dv.costo_unitario_momento) AS ganancia_bruta,
    ((v.total_final - SUM(dv.cantidad * dv.costo_unitario_momento)) / v.total_final * 100) AS margen_porcentaje
FROM ventas v
INNER JOIN detalle_ventas dv ON v.id_venta = dv.id_venta
LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
WHERE v.estado = 'CERTIFICADA'
GROUP BY v.id_venta, v.numero_documento, v.fecha_venta, c.nombre, v.total_final;

-- =====================================================
-- DATOS INICIALES
-- =====================================================

INSERT INTO roles (nombre, descripcion) VALUES
    ('ADMINISTRADOR', 'Acceso total al sistema'),
    ('VENDEDOR', 'Punto de venta y consultas basicas'),
    ('BODEGUERO', 'Gestion de inventario y compras'),
    ('CONTADOR', 'Acceso a reportes contables')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO tipos_movimiento (codigo, nombre, afecta_stock, modulo_origen) VALUES
    ('VENTA', 'Venta de Producto', 'SALIDA', 'VENTAS'),
    ('COMPRA', 'Compra a Proveedor', 'ENTRADA', 'COMPRAS'),
    ('AJUSTE_ENTRADA', 'Ajuste por Entrada', 'ENTRADA', 'AJUSTE'),
    ('AJUSTE_SALIDA', 'Ajuste por Salida', 'SALIDA', 'AJUSTE'),
    ('MERMA', 'Producto Danado/Perdido', 'SALIDA', 'AJUSTE'),
    ('DEVOLUCION_CLIENTE', 'Devolucion de Cliente', 'ENTRADA', 'VENTAS'),
    ('DEVOLUCION_PROVEEDOR', 'Devolucion a Proveedor', 'SALIDA', 'COMPRAS'),
    ('TRASLADO_SALIDA', 'Traslado entre Sucursales (Salida)', 'SALIDA', 'TRASLADO'),
    ('TRASLADO_ENTRADA', 'Traslado entre Sucursales (Entrada)', 'ENTRADA', 'TRASLADO')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO unidades_medida (codigo, nombre) VALUES
    ('UND', 'Unidad'),
    ('KG', 'Kilogramo'),
    ('LT', 'Litro'),
    ('MT', 'Metro'),
    ('CJ', 'Caja'),
    ('PAQ', 'Paquete')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO formas_pago (codigo, nombre, dias_acreditacion) VALUES
    ('EFECTIVO', 'Efectivo', 0),
    ('TARJETA', 'Tarjeta Credito/Debito', 1),
    ('TRANSFERENCIA', 'Transferencia Bancaria', 1),
    ('CHEQUE', 'Cheque', 3),
    ('CREDITO', 'Credito', 30)
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO tipos_impuesto (codigo, nombre, porcentaje, fecha_vigencia_inicio) VALUES
    ('IVA12', 'IVA 12%', 12.00, '2020-01-01'),
    ('EXENTO', 'Exento', 0.00, '2020-01-01')
ON CONFLICT (codigo) DO NOTHING;

-- =====================================================
-- MODULO DE COLAS DE TRABAJO (JOBS)
-- =====================================================

CREATE TABLE IF NOT EXISTS jobs (
    id_job SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL, -- 'IMPORT_PRODUCTS', 'EXPORT_SALES', etc.
    estado VARCHAR(20) DEFAULT 'PENDIENTE', -- 'PENDIENTE', 'PROCESANDO', 'COMPLETADO', 'FALLIDO'
    payload JSONB, -- Datos de entrada (e.g., ruta del archivo)
    resultado JSONB, -- Datos de salida (e.g., filas procesadas, errores)
    progreso INT DEFAULT 0,
    mensaje_error TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_inicio TIMESTAMP,
    fecha_fin TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_jobs_estado ON jobs(estado);
