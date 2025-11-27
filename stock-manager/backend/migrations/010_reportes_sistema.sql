-- =====================================================
-- MIGRACIÓN 010: SISTEMA DE REPORTES E INFORMES
-- =====================================================
-- Sistema completo de generación, almacenamiento y auditoría de reportes

-- =====================================================
-- CATÁLOGO DE TIPOS DE REPORTE
-- =====================================================

CREATE TABLE IF NOT EXISTS tipos_reporte (
    id_tipo_reporte SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('VENTAS', 'INVENTARIO', 'CONTABILIDAD', 'FISCAL', 'GERENCIAL', 'AUDITORIA', 'RECURSOS_HUMANOS')),
    subcategoria VARCHAR(50),
    plantilla_nombre VARCHAR(100),
    parametros_requeridos JSONB,
    parametros_opcionales JSONB,
    formatos_disponibles TEXT[] DEFAULT ARRAY['PDF', 'EXCEL', 'CSV'],
    requiere_autorizacion BOOLEAN DEFAULT FALSE,
    nivel_acceso_minimo INT DEFAULT 1,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tipos_reporte_codigo ON tipos_reporte(codigo);
CREATE INDEX idx_tipos_reporte_categoria ON tipos_reporte(categoria);

COMMENT ON TABLE tipos_reporte IS 'Catálogo de tipos de reportes disponibles en el sistema';
COMMENT ON COLUMN tipos_reporte.parametros_requeridos IS 'JSON con parámetros obligatorios: {fecha_inicio, fecha_fin, sucursal, etc}';

-- =====================================================
-- REPORTES GENERADOS (HISTORIAL)
-- =====================================================

CREATE TABLE IF NOT EXISTS reportes_generados (
    id_reporte_generado BIGSERIAL PRIMARY KEY,
    id_tipo_reporte INT REFERENCES tipos_reporte(id_tipo_reporte),
    nombre_archivo VARCHAR(255) NOT NULL,
    titulo_reporte VARCHAR(255),
    descripcion TEXT,
    
    -- Usuario y Autorización
    id_usuario_genera INT REFERENCES usuarios(id_usuario),
    id_usuario_autoriza INT REFERENCES usuarios(id_usuario),
    requirio_autorizacion BOOLEAN DEFAULT FALSE,
    fecha_autorizacion TIMESTAMP,
    
    -- Parámetros
    parametros_utilizados JSONB NOT NULL,
    filtros_aplicados JSONB,
    
    -- Resultado
    formato VARCHAR(20) NOT NULL CHECK (formato IN ('PDF', 'EXCEL', 'CSV', 'JSON', 'XML')),
    url_archivo TEXT NOT NULL,
    ruta_servidor TEXT,
    tamano_bytes BIGINT,
    hash_archivo VARCHAR(64),
    numero_registros INT,
    numero_paginas INT,
    
    -- Metadata
    tiempo_generacion_ms INT,
    fecha_generacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP,
    vistas INT DEFAULT 0,
    descargas INT DEFAULT 0,
    
    -- Estado
    estado VARCHAR(20) DEFAULT 'GENERADO' CHECK (estado IN ('GENERANDO', 'GENERADO', 'ERROR', 'EXPIRADO', 'ELIMINADO')),
    mensaje_error TEXT,
    
    -- Auditoría
    ip_generacion INET,
    datos_adicionales JSONB,
    
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reportes_generados_tipo ON reportes_generados(id_tipo_reporte);
CREATE INDEX idx_reportes_generados_usuario ON reportes_generados(id_usuario_genera);
CREATE INDEX idx_reportes_generados_fecha ON reportes_generados(fecha_generacion);
CREATE INDEX idx_reportes_generados_estado ON reportes_generados(estado);
CREATE INDEX idx_reportes_generados_hash ON reportes_generados(hash_archivo);

COMMENT ON TABLE reportes_generados IS 'Historial completo de reportes generados con copia almacenada';
COMMENT ON COLUMN reportes_generados.hash_archivo IS 'SHA-256 del archivo para verificar integridad';

-- =====================================================
-- LOGS DE EXPORTACIÓN DETALLADOS
-- =====================================================

CREATE TABLE IF NOT EXISTS logs_exportacion (
    id_log_exportacion BIGSERIAL PRIMARY KEY,
    id_reporte_generado BIGINT REFERENCES reportes_generados(id_reporte_generado),
    tipo_exportacion VARCHAR(50) NOT NULL,
    tabla_origen VARCHAR(50),
    
    -- Detalles de la Exportación
    registros_totales INT,
    registros_exportados INT,
    registros_omitidos INT,
    registros_error INT,
    
    -- Filtros y Configuración
    filtros_sql TEXT,
    columnas_exportadas TEXT[],
    orden_aplicado VARCHAR(255),
    
    -- Performance
    tiempo_consulta_ms INT,
    tiempo_generacion_ms INT,
    tiempo_total_ms INT,
    
    -- Resultado
    exitoso BOOLEAN NOT NULL,
    mensaje_resultado TEXT,
    errores_detalle JSONB,
    
    -- Auditoría
    id_usuario INT REFERENCES usuarios(id_usuario),
    ip_address INET,
    fecha_exportacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_logs_exportacion_reporte ON logs_exportacion(id_reporte_generado);
CREATE INDEX idx_logs_exportacion_tipo ON logs_exportacion(tipo_exportacion);
CREATE INDEX idx_logs_exportacion_fecha ON logs_exportacion(fecha_exportacion);
CREATE INDEX idx_logs_exportacion_usuario ON logs_exportacion(id_usuario);

COMMENT ON TABLE logs_exportacion IS 'Log detallado de cada proceso de exportación';

-- =====================================================
-- REPORTES PROGRAMADOS (AUTOMÁTICOS)
-- =====================================================

CREATE TABLE IF NOT EXISTS reportes_programados (
    id_reporte_programado SERIAL PRIMARY KEY,
    id_tipo_reporte INT REFERENCES tipos_reporte(id_tipo_reporte),
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    
    -- Programación
    frecuencia VARCHAR(20) NOT NULL CHECK (frecuencia IN ('DIARIO', 'SEMANAL', 'QUINCENAL', 'MENSUAL', 'TRIMESTRAL', 'ANUAL')),
    dia_ejecucion INT,
    hora_ejecucion TIME NOT NULL,
    dia_semana INT CHECK (dia_semana BETWEEN 1 AND 7),
    
    -- Parámetros
    parametros_fijos JSONB,
    formato_salida VARCHAR(20) DEFAULT 'PDF',
    
    -- Destinatarios
    emails_destinatarios TEXT[],
    incluir_en_dashboard BOOLEAN DEFAULT FALSE,
    
    -- Control de Ejecución
    ultima_ejecucion TIMESTAMP,
    proxima_ejecucion TIMESTAMP,
    ejecuciones_exitosas INT DEFAULT 0,
    ejecuciones_fallidas INT DEFAULT 0,
    
    -- Estado
    activo BOOLEAN DEFAULT TRUE,
    id_usuario_crea INT REFERENCES usuarios(id_usuario),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reportes_programados_tipo ON reportes_programados(id_tipo_reporte);
CREATE INDEX idx_reportes_programados_proxima ON reportes_programados(proxima_ejecucion);
CREATE INDEX idx_reportes_programados_activo ON reportes_programados(activo);

COMMENT ON TABLE reportes_programados IS 'Reportes automáticos programados con envío por email';

-- =====================================================
-- HISTORIAL DE EJECUCIONES DE REPORTES PROGRAMADOS
-- =====================================================

CREATE TABLE IF NOT EXISTS historial_ejecuciones_programadas (
    id_ejecucion BIGSERIAL PRIMARY KEY,
    id_reporte_programado INT REFERENCES reportes_programados(id_reporte_programado),
    id_reporte_generado BIGINT REFERENCES reportes_generados(id_reporte_generado),
    fecha_programada TIMESTAMP NOT NULL,
    fecha_ejecucion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    exitoso BOOLEAN NOT NULL,
    tiempo_ejecucion_ms INT,
    mensaje_resultado TEXT,
    emails_enviados INT DEFAULT 0,
    emails_fallidos INT DEFAULT 0,
    error_detalle TEXT
);

CREATE INDEX idx_historial_ejecuciones_programado ON historial_ejecuciones_programadas(id_reporte_programado);
CREATE INDEX idx_historial_ejecuciones_fecha ON historial_ejecuciones_programadas(fecha_ejecucion);

-- =====================================================
-- VISTAS DE REPORTES (ACCESO RÁPIDO)
-- =====================================================

CREATE TABLE IF NOT EXISTS vistas_reporte (
    id_vista BIGSERIAL PRIMARY KEY,
    id_reporte_generado BIGINT REFERENCES reportes_generados(id_reporte_generado),
    id_usuario INT REFERENCES usuarios(id_usuario),
    fecha_vista TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tiempo_visualizacion_segundos INT,
    ip_address INET
);

CREATE INDEX idx_vistas_reporte_reporte ON vistas_reporte(id_reporte_generado);
CREATE INDEX idx_vistas_reporte_usuario ON vistas_reporte(id_usuario);

-- =====================================================
-- DESCARGAS DE REPORTES
-- =====================================================

CREATE TABLE IF NOT EXISTS descargas_reporte (
    id_descarga BIGSERIAL PRIMARY KEY,
    id_reporte_generado BIGINT REFERENCES reportes_generados(id_reporte_generado),
    id_usuario INT REFERENCES usuarios(id_usuario),
    fecha_descarga TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    exitoso BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_descargas_reporte_reporte ON descargas_reporte(id_reporte_generado);
CREATE INDEX idx_descargas_reporte_usuario ON descargas_reporte(id_usuario);

-- =====================================================
-- TRIGGERS PARA ACTUALIZAR CONTADORES
-- =====================================================

CREATE OR REPLACE FUNCTION incrementar_vistas_reporte()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE reportes_generados
    SET vistas = vistas + 1
    WHERE id_reporte_generado = NEW.id_reporte_generado;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_incrementar_vistas
AFTER INSERT ON vistas_reporte
FOR EACH ROW EXECUTE FUNCTION incrementar_vistas_reporte();

CREATE OR REPLACE FUNCTION incrementar_descargas_reporte()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE reportes_generados
    SET descargas = descargas + 1
    WHERE id_reporte_generado = NEW.id_reporte_generado;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_incrementar_descargas
AFTER INSERT ON descargas_reporte
FOR EACH ROW EXECUTE FUNCTION incrementar_descargas_reporte();

-- =====================================================
-- DATOS INICIALES - TIPOS DE REPORTE
-- =====================================================

INSERT INTO tipos_reporte (codigo, nombre, descripcion, categoria, subcategoria, parametros_requeridos, formatos_disponibles) VALUES
-- Ventas
('REP_VENTAS_DIARIAS', 'Reporte de Ventas Diarias', 'Ventas realizadas por día', 'VENTAS', 'DIARIO', '{"fecha_inicio": "date", "fecha_fin": "date", "sucursal": "int"}', ARRAY['PDF', 'EXCEL', 'CSV']),
('REP_VENTAS_PRODUCTO', 'Ventas por Producto', 'Detalle de ventas por producto', 'VENTAS', 'PRODUCTOS', '{"fecha_inicio": "date", "fecha_fin": "date"}', ARRAY['PDF', 'EXCEL']),
('REP_VENTAS_CLIENTE', 'Ventas por Cliente', 'Historial de ventas por cliente', 'VENTAS', 'CLIENTES', '{"id_cliente": "int", "fecha_inicio": "date", "fecha_fin": "date"}', ARRAY['PDF', 'EXCEL']),
('REP_COMISIONES', 'Reporte de Comisiones', 'Comisiones de vendedores', 'VENTAS', 'COMISIONES', '{"fecha_inicio": "date", "fecha_fin": "date"}', ARRAY['PDF', 'EXCEL']),

-- Inventario
('REP_STOCK_ACTUAL', 'Stock Actual', 'Inventario actual por sucursal', 'INVENTARIO', 'STOCK', '{"sucursal": "int"}', ARRAY['PDF', 'EXCEL', 'CSV']),
('REP_KARDEX', 'Kardex de Producto', 'Movimientos de inventario', 'INVENTARIO', 'KARDEX', '{"id_producto": "int", "fecha_inicio": "date", "fecha_fin": "date"}', ARRAY['PDF', 'EXCEL']),
('REP_PRODUCTOS_VENCER', 'Productos por Vencer', 'Productos próximos a vencer', 'INVENTARIO', 'VENCIMIENTOS', '{"dias": "int"}', ARRAY['PDF', 'EXCEL']),
('REP_STOCK_MINIMO', 'Productos en Stock Mínimo', 'Productos bajo punto de reorden', 'INVENTARIO', 'ALERTAS', '{}', ARRAY['PDF', 'EXCEL']),

-- Contabilidad
('REP_BALANCE_GENERAL', 'Balance General', 'Balance general por período', 'CONTABILIDAD', 'ESTADOS_FINANCIEROS', '{"id_periodo": "int"}', ARRAY['PDF', 'EXCEL']),
('REP_ESTADO_RESULTADOS', 'Estado de Resultados', 'Estado de resultados por período', 'CONTABILIDAD', 'ESTADOS_FINANCIEROS', '{"id_periodo": "int"}', ARRAY['PDF', 'EXCEL']),
('REP_LIBRO_DIARIO', 'Libro Diario', 'Libro diario contable', 'CONTABILIDAD', 'LIBROS', '{"fecha_inicio": "date", "fecha_fin": "date"}', ARRAY['PDF', 'EXCEL']),
('REP_LIBRO_MAYOR', 'Libro Mayor', 'Libro mayor por cuenta', 'CONTABILIDAD', 'LIBROS', '{"id_cuenta": "int", "fecha_inicio": "date", "fecha_fin": "date"}', ARRAY['PDF', 'EXCEL']),
('REP_BALANCE_COMPROBACION', 'Balance de Comprobación', 'Balance de comprobación', 'CONTABILIDAD', 'BALANCES', '{"id_periodo": "int"}', ARRAY['PDF', 'EXCEL']),

-- Fiscal
('REP_LIBRO_VENTAS_SAT', 'Libro de Ventas SAT', 'Libro de ventas según formato SAT', 'FISCAL', 'LIBROS_SAT', '{"mes": "int", "anio": "int"}', ARRAY['PDF', 'EXCEL', 'XML']),
('REP_LIBRO_COMPRAS_SAT', 'Libro de Compras SAT', 'Libro de compras según formato SAT', 'FISCAL', 'LIBROS_SAT', '{"mes": "int", "anio": "int"}', ARRAY['PDF', 'EXCEL', 'XML']),
('REP_DECLARACION_IVA', 'Declaración de IVA', 'Datos para declaración de IVA', 'FISCAL', 'DECLARACIONES', '{"mes": "int", "anio": "int"}', ARRAY['PDF', 'EXCEL']),
('REP_RETENCIONES_ISR', 'Retenciones de ISR', 'Reporte de retenciones realizadas', 'FISCAL', 'RETENCIONES', '{"fecha_inicio": "date", "fecha_fin": "date"}', ARRAY['PDF', 'EXCEL']),

-- Gerencial
('REP_RENTABILIDAD', 'Análisis de Rentabilidad', 'Rentabilidad por producto/categoría', 'GERENCIAL', 'RENTABILIDAD', '{"fecha_inicio": "date", "fecha_fin": "date"}', ARRAY['PDF', 'EXCEL']),
('REP_FLUJO_EFECTIVO', 'Flujo de Efectivo', 'Flujo de efectivo proyectado', 'GERENCIAL', 'FINANZAS', '{"fecha_inicio": "date", "fecha_fin": "date"}', ARRAY['PDF', 'EXCEL']),
('REP_CUENTAS_COBRAR', 'Cuentas por Cobrar', 'Estado de cuentas por cobrar', 'GERENCIAL', 'CARTERA', '{}', ARRAY['PDF', 'EXCEL']),
('REP_CUENTAS_PAGAR', 'Cuentas por Pagar', 'Estado de cuentas por pagar', 'GERENCIAL', 'CARTERA', '{}', ARRAY['PDF', 'EXCEL'])

ON CONFLICT (codigo) DO NOTHING;
