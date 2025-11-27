-- =====================================================
-- MIGRACIÓN 011: AUDITORÍAS SEGÚN SAT GUATEMALA
-- =====================================================
-- Sistema de auditorías fiscales según normativas SAT

-- =====================================================
-- AUDITORÍAS SAT
-- =====================================================

CREATE TABLE IF NOT EXISTS auditorias_sat (
    id_auditoria_sat SERIAL PRIMARY KEY,
    tipo_auditoria VARCHAR(50) NOT NULL CHECK (tipo_auditoria IN ('LIBRO_VENTAS', 'LIBRO_COMPRAS', 'INVENTARIOS', 'DECLARACION_IVA', 'DECLARACION_ISR', 'RETENCIONES', 'GENERAL')),
    periodo_auditado VARCHAR(20) NOT NULL,
    fecha_inicio_periodo DATE NOT NULL,
    fecha_fin_periodo DATE NOT NULL,
    
    -- Auditor
    auditor_nombre VARCHAR(150),
    auditor_cargo VARCHAR(100),
    numero_credencial VARCHAR(50),
    
    -- Proceso
    fecha_inicio_auditoria DATE NOT NULL,
    fecha_fin_auditoria DATE,
    estado VARCHAR(20) DEFAULT 'EN_PROCESO' CHECK (estado IN ('PROGRAMADA', 'EN_PROCESO', 'COMPLETADA', 'CON_OBSERVACIONES', 'CERRADA')),
    
    -- Resultados
    hallazgos TEXT,
    observaciones TEXT,
    recomendaciones TEXT,
    documentos_solicitados TEXT[],
    documentos_entregados TEXT[],
    
    -- Archivos
    acta_inicio_url TEXT,
    acta_cierre_url TEXT,
    informe_auditoria_url TEXT,
    documentos_adjuntos JSONB,
    
    -- Seguimiento
    requiere_seguimiento BOOLEAN DEFAULT FALSE,
    fecha_seguimiento DATE,
    seguimiento_completado BOOLEAN DEFAULT FALSE,
    
    id_usuario_responsable INT REFERENCES usuarios(id_usuario),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_auditorias_sat_tipo ON auditorias_sat(tipo_auditoria);
CREATE INDEX idx_auditorias_sat_periodo ON auditorias_sat(periodo_auditado);
CREATE INDEX idx_auditorias_sat_estado ON auditorias_sat(estado);
CREATE INDEX idx_auditorias_sat_fecha_inicio ON auditorias_sat(fecha_inicio_auditoria);

COMMENT ON TABLE auditorias_sat IS 'Registro de auditorías fiscales realizadas por SAT';

-- =====================================================
-- DECLARACIONES FISCALES
-- =====================================================

CREATE TABLE IF NOT EXISTS declaraciones_fiscales (
    id_declaracion SERIAL PRIMARY KEY,
    tipo_declaracion VARCHAR(50) NOT NULL CHECK (tipo_declaracion IN ('IVA', 'ISR', 'IUSI', 'ISO', 'TIMBRE_PRENSA', 'OTRO')),
    periodo_fiscal VARCHAR(20) NOT NULL,
    mes INT CHECK (mes BETWEEN 1 AND 12),
    anio INT NOT NULL,
    
    -- Montos
    monto_declarado DECIMAL(14,2) NOT NULL,
    monto_pagado DECIMAL(14,2) DEFAULT 0,
    monto_pendiente DECIMAL(14,2) GENERATED ALWAYS AS (monto_declarado - monto_pagado) STORED,
    
    -- Presentación
    fecha_presentacion DATE NOT NULL,
    fecha_limite DATE NOT NULL,
    presentada_tiempo BOOLEAN GENERATED ALWAYS AS (fecha_presentacion <= fecha_limite) STORED,
    
    -- SAT
    numero_recibo_sat VARCHAR(50) UNIQUE,
    numero_boleta VARCHAR(50),
    numero_operacion_bancaria VARCHAR(50),
    
    -- Archivos
    xml_declaracion TEXT,
    pdf_declaracion_url TEXT,
    comprobante_pago_url TEXT,
    
    -- Estado
    estado VARCHAR(20) DEFAULT 'PRESENTADA' CHECK (estado IN ('BORRADOR', 'PRESENTADA', 'PAGADA', 'RECTIFICADA', 'ANULADA')),
    
    -- Rectificaciones
    es_rectificativa BOOLEAN DEFAULT FALSE,
    id_declaracion_original INT REFERENCES declaraciones_fiscales(id_declaracion),
    motivo_rectificacion TEXT,
    
    id_usuario_presenta INT REFERENCES usuarios(id_usuario),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_declaraciones_tipo ON declaraciones_fiscales(tipo_declaracion);
CREATE INDEX idx_declaraciones_periodo ON declaraciones_fiscales(anio, mes);
CREATE INDEX idx_declaraciones_estado ON declaraciones_fiscales(estado);
CREATE INDEX idx_declaraciones_fecha_presentacion ON declaraciones_fiscales(fecha_presentacion);

COMMENT ON TABLE declaraciones_fiscales IS 'Registro de declaraciones fiscales presentadas a SAT';

-- =====================================================
-- RETENCIONES DE IVA
-- =====================================================

CREATE TABLE IF NOT EXISTS retenciones_iva (
    id_retencion_iva SERIAL PRIMARY KEY,
    numero_constancia VARCHAR(50) UNIQUE NOT NULL,
    fecha_retencion DATE NOT NULL,
    
    -- Proveedor
    id_proveedor INT REFERENCES proveedores(id_proveedor),
    nit_proveedor VARCHAR(20) NOT NULL,
    nombre_proveedor VARCHAR(150) NOT NULL,
    
    -- Documento Origen
    documento_origen VARCHAR(30) NOT NULL,
    id_documento_origen INT,
    numero_factura VARCHAR(50),
    serie_factura VARCHAR(20),
    fecha_factura DATE,
    
    -- Montos
    monto_base DECIMAL(12,2) NOT NULL,
    porcentaje_retencion DECIMAL(5,2) NOT NULL DEFAULT 15.00,
    monto_retenido DECIMAL(12,2) NOT NULL,
    
    -- Tipo de Retención
    tipo_bien_servicio VARCHAR(100),
    codigo_retencion VARCHAR(20),
    
    -- Constancia
    constancia_generada BOOLEAN DEFAULT FALSE,
    fecha_generacion_constancia TIMESTAMP,
    url_constancia_pdf TEXT,
    
    -- Declaración
    id_declaracion INT REFERENCES declaraciones_fiscales(id_declaracion),
    declarada BOOLEAN DEFAULT FALSE,
    fecha_declaracion DATE,
    
    id_usuario_registra INT REFERENCES usuarios(id_usuario),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_retenciones_iva_proveedor ON retenciones_iva(id_proveedor);
CREATE INDEX idx_retenciones_iva_fecha ON retenciones_iva(fecha_retencion);
CREATE INDEX idx_retenciones_iva_declaracion ON retenciones_iva(id_declaracion);
CREATE INDEX idx_retenciones_iva_documento ON retenciones_iva(documento_origen, id_documento_origen);

COMMENT ON TABLE retenciones_iva IS 'Retenciones de IVA realizadas a proveedores';

-- =====================================================
-- RETENCIONES DE ISR
-- =====================================================

CREATE TABLE IF NOT EXISTS retenciones_isr (
    id_retencion_isr SERIAL PRIMARY KEY,
    numero_constancia VARCHAR(50) UNIQUE NOT NULL,
    fecha_retencion DATE NOT NULL,
    
    -- Beneficiario
    tipo_beneficiario VARCHAR(20) CHECK (tipo_beneficiario IN ('PROVEEDOR', 'EMPLEADO', 'PROFESIONAL', 'OTRO')),
    id_beneficiario INT,
    nit_beneficiario VARCHAR(20) NOT NULL,
    nombre_beneficiario VARCHAR(150) NOT NULL,
    
    -- Documento Origen
    documento_origen VARCHAR(30) NOT NULL,
    id_documento_origen INT,
    numero_documento VARCHAR(50),
    
    -- Tipo de Retención según SAT
    codigo_retencion VARCHAR(10) NOT NULL,
    descripcion_retencion VARCHAR(255),
    porcentaje_retencion DECIMAL(5,2) NOT NULL,
    
    -- Montos
    monto_base DECIMAL(12,2) NOT NULL,
    monto_retenido DECIMAL(12,2) NOT NULL,
    
    -- Constancia
    constancia_generada BOOLEAN DEFAULT FALSE,
    fecha_generacion_constancia TIMESTAMP,
    url_constancia_pdf TEXT,
    
    -- Declaración
    id_declaracion INT REFERENCES declaraciones_fiscales(id_declaracion),
    declarada BOOLEAN DEFAULT FALSE,
    fecha_declaracion DATE,
    
    id_usuario_registra INT REFERENCES usuarios(id_usuario),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_retenciones_isr_beneficiario ON retenciones_isr(tipo_beneficiario, id_beneficiario);
CREATE INDEX idx_retenciones_isr_fecha ON retenciones_isr(fecha_retencion);
CREATE INDEX idx_retenciones_isr_codigo ON retenciones_isr(codigo_retencion);
CREATE INDEX idx_retenciones_isr_declaracion ON retenciones_isr(id_declaracion);

COMMENT ON TABLE retenciones_isr IS 'Retenciones de ISR realizadas';
COMMENT ON COLUMN retenciones_isr.codigo_retencion IS 'Código según tabla de retenciones SAT';

-- =====================================================
-- LOGS DEL SISTEMA (DETALLADOS)
-- =====================================================

CREATE TABLE IF NOT EXISTS logs_sistema (
    id_log BIGSERIAL PRIMARY KEY,
    nivel VARCHAR(20) NOT NULL CHECK (nivel IN ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL')),
    modulo VARCHAR(50) NOT NULL,
    funcion VARCHAR(100),
    mensaje TEXT NOT NULL,
    stack_trace TEXT,
    
    -- Contexto
    id_usuario INT REFERENCES usuarios(id_usuario),
    ip_address INET,
    url_solicitada TEXT,
    metodo_http VARCHAR(10),
    
    -- Datos Adicionales
    datos_contexto JSONB,
    tiempo_ejecucion_ms INT,
    
    -- Metadata
    servidor VARCHAR(50),
    proceso_id INT,
    thread_id INT,
    
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Particionamiento por mes para mejor performance
CREATE INDEX idx_logs_sistema_nivel ON logs_sistema(nivel);
CREATE INDEX idx_logs_sistema_modulo ON logs_sistema(modulo);
CREATE INDEX idx_logs_sistema_fecha ON logs_sistema(fecha_creacion);
CREATE INDEX idx_logs_sistema_usuario ON logs_sistema(id_usuario);

COMMENT ON TABLE logs_sistema IS 'Logs detallados del sistema con retención de 90 días';

-- =====================================================
-- MEJORAS A AUDITORÍA GENERAL
-- =====================================================

-- Agregar campos de seguridad a auditoria_general
ALTER TABLE auditoria_general ADD COLUMN IF NOT EXISTS hash_registro VARCHAR(64);
ALTER TABLE auditoria_general ADD COLUMN IF NOT EXISTS firma_digital TEXT;
ALTER TABLE auditoria_general ADD COLUMN IF NOT EXISTS dispositivo VARCHAR(100);
ALTER TABLE auditoria_general ADD COLUMN IF NOT EXISTS navegador VARCHAR(50);
ALTER TABLE auditoria_general ADD COLUMN IF NOT EXISTS sistema_operativo VARCHAR(50);
ALTER TABLE auditoria_general ADD COLUMN IF NOT EXISTS geolocalizacion JSONB;

CREATE INDEX IF NOT EXISTS idx_auditoria_hash ON auditoria_general(hash_registro);

COMMENT ON COLUMN auditoria_general.hash_registro IS 'SHA-256 del registro para detectar manipulación';
COMMENT ON COLUMN auditoria_general.geolocalizacion IS 'Ubicación GPS opcional: {lat, lng, precision}';

-- =====================================================
-- FUNCIÓN PARA GENERAR HASH DE AUDITORÍA
-- =====================================================

CREATE OR REPLACE FUNCTION generar_hash_auditoria()
RETURNS TRIGGER AS $$
BEGIN
    NEW.hash_registro := encode(
        digest(
            CONCAT(
                NEW.tabla_afectada,
                NEW.id_registro_afectado,
                NEW.operacion,
                COALESCE(NEW.datos_anteriores::TEXT, ''),
                COALESCE(NEW.datos_nuevos::TEXT, ''),
                NEW.fecha_operacion
            ),
            'sha256'
        ),
        'hex'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generar_hash_auditoria ON auditoria_general;
CREATE TRIGGER trigger_generar_hash_auditoria
BEFORE INSERT ON auditoria_general
FOR EACH ROW EXECUTE FUNCTION generar_hash_auditoria();



-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Códigos de retención ISR según SAT Guatemala
CREATE TABLE IF NOT EXISTS codigos_retencion_isr (
    codigo VARCHAR(10) PRIMARY KEY,
    descripcion VARCHAR(255) NOT NULL,
    porcentaje DECIMAL(5,2) NOT NULL,
    tipo_servicio VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE
);

INSERT INTO codigos_retencion_isr (codigo, descripcion, porcentaje, tipo_servicio) VALUES
('01', 'Servicios Técnicos', 5.00, 'SERVICIOS'),
('02', 'Servicios Profesionales', 5.00, 'SERVICIOS'),
('03', 'Arrendamiento de Bienes Inmuebles', 5.00, 'ARRENDAMIENTO'),
('04', 'Arrendamiento de Bienes Muebles', 5.00, 'ARRENDAMIENTO'),
('05', 'Transporte de Carga', 5.00, 'TRANSPORTE'),
('06', 'Transporte de Pasajeros', 5.00, 'TRANSPORTE'),
('07', 'Comisiones', 5.00, 'COMISIONES'),
('08', 'Honorarios', 5.00, 'HONORARIOS'),
('09', 'Regalías', 15.00, 'REGALIAS'),
('10', 'Premios y Sorteos', 10.00, 'PREMIOS')
ON CONFLICT (codigo) DO NOTHING;

COMMENT ON TABLE codigos_retencion_isr IS 'Catálogo de códigos de retención ISR según SAT';
