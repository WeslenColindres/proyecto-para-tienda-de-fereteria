-- =====================================================
-- MIGRACIÓN 012: MEJORAS DE FACTURACIÓN FEL
-- =====================================================
-- Mejoras completas para cumplimiento FEL SAT Guatemala

-- =====================================================
-- MEJORAS A TABLA VENTAS
-- =====================================================

-- Agregar campos FEL a ventas
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS tipo_dte VARCHAR(10) DEFAULT 'FACT';
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS regimen_iva VARCHAR(30) DEFAULT 'GENERAL';
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS fecha_emision_dte TIMESTAMP;
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS fecha_certificacion_dte TIMESTAMP;
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS xml_dte JSONB;
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS verificacion_url TEXT;
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS contingencia BOOLEAN DEFAULT FALSE;
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS numero_acceso VARCHAR(50);
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS motivo_contingencia TEXT;
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS resolucion_contingencia VARCHAR(50);

-- Índices para FEL
CREATE INDEX IF NOT EXISTS idx_ventas_tipo_dte ON ventas(tipo_dte);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha_emision ON ventas(fecha_emision_dte);
CREATE INDEX IF NOT EXISTS idx_ventas_contingencia ON ventas(contingencia);

COMMENT ON COLUMN ventas.tipo_dte IS 'FACT, FCAM, FPEQ, NCRE, NDEB, RECI, NABN, FEXP, etc.';
COMMENT ON COLUMN ventas.regimen_iva IS 'GENERAL, PEQUEÑO_CONTRIBUYENTE, EXENTO';
COMMENT ON COLUMN ventas.numero_acceso IS 'Número de acceso para verificación en portal SAT';

-- =====================================================
-- TIPOS DE DTE (DOCUMENTOS TRIBUTARIOS ELECTRÓNICOS)
-- =====================================================

CREATE TABLE IF NOT EXISTS tipos_dte (
    codigo VARCHAR(10) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    requiere_referencia BOOLEAN DEFAULT FALSE,
    afecta_inventario BOOLEAN DEFAULT TRUE,
    signo_contable VARCHAR(10) CHECK (signo_contable IN ('POSITIVO', 'NEGATIVO', 'NEUTRO')),
    activo BOOLEAN DEFAULT TRUE
);

INSERT INTO tipos_dte (codigo, nombre, descripcion, requiere_referencia, afecta_inventario, signo_contable) VALUES
('FACT', 'Factura', 'Factura de venta normal', FALSE, TRUE, 'POSITIVO'),
('FCAM', 'Factura Cambiaria', 'Factura cambiaria', FALSE, TRUE, 'POSITIVO'),
('FPEQ', 'Factura Pequeño Contribuyente', 'Factura para pequeño contribuyente', FALSE, TRUE, 'POSITIVO'),
('NCRE', 'Nota de Crédito', 'Nota de crédito', TRUE, TRUE, 'NEGATIVO'),
('NDEB', 'Nota de Débito', 'Nota de débito', TRUE, FALSE, 'POSITIVO'),
('RECI', 'Recibo', 'Recibo de pago', FALSE, FALSE, 'NEUTRO'),
('NABN', 'Nota de Abono', 'Nota de abono', TRUE, FALSE, 'NEGATIVO'),
('FEXP', 'Factura de Exportación', 'Factura de exportación', FALSE, TRUE, 'POSITIVO'),
('FCAP', 'Factura Cambiaria de Abono', 'Factura cambiaria de abono', TRUE, FALSE, 'NEGATIVO')
ON CONFLICT (codigo) DO NOTHING;

COMMENT ON TABLE tipos_dte IS 'Catálogo de tipos de DTE según SAT Guatemala';

-- =====================================================
-- ANULACIONES DE DTE
-- =====================================================

CREATE TABLE IF NOT EXISTS anulaciones_dte (
    id_anulacion SERIAL PRIMARY KEY,
    id_venta INT REFERENCES ventas(id_venta),
    uuid_dte_anular VARCHAR(100) NOT NULL,
    
    -- Motivo según catálogo SAT
    codigo_motivo VARCHAR(10) NOT NULL,
    descripcion_motivo TEXT NOT NULL,
    
    -- Proceso de Anulación
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_anulacion_sat TIMESTAMP,
    uuid_anulacion_sat VARCHAR(100),
    numero_autorizacion_anulacion VARCHAR(100),
    
    -- Estado
    estado VARCHAR(20) DEFAULT 'SOLICITADA' CHECK (estado IN ('SOLICITADA', 'PROCESANDO', 'ANULADA', 'RECHAZADA')),
    mensaje_sat TEXT,
    
    -- Auditoría
    id_usuario_solicita INT REFERENCES usuarios(id_usuario),
    id_usuario_autoriza INT REFERENCES usuarios(id_usuario),
    requiere_autorizacion BOOLEAN DEFAULT TRUE,
    fecha_autorizacion TIMESTAMP,
    
    -- Documentos
    xml_anulacion JSONB,
    pdf_anulacion_url TEXT,
    
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_anulaciones_venta ON anulaciones_dte(id_venta);
CREATE INDEX idx_anulaciones_uuid ON anulaciones_dte(uuid_dte_anular);
CREATE INDEX idx_anulaciones_estado ON anulaciones_dte(estado);

COMMENT ON TABLE anulaciones_dte IS 'Registro de anulaciones de DTE según proceso SAT';

-- =====================================================
-- MOTIVOS DE ANULACIÓN SAT
-- =====================================================

CREATE TABLE IF NOT EXISTS motivos_anulacion_sat (
    codigo VARCHAR(10) PRIMARY KEY,
    descripcion VARCHAR(255) NOT NULL,
    requiere_justificacion BOOLEAN DEFAULT TRUE,
    activo BOOLEAN DEFAULT TRUE
);

INSERT INTO motivos_anulacion_sat (codigo, descripcion, requiere_justificacion) VALUES
('01', 'Error en datos del receptor', TRUE),
('02', 'Error en monto total', TRUE),
('03', 'Error en descripción de productos/servicios', TRUE),
('04', 'Documento duplicado', TRUE),
('05', 'Anulación por devolución', FALSE),
('06', 'Anulación por cancelación de venta', FALSE),
('07', 'Error en fecha de emisión', TRUE),
('08', 'Otros errores', TRUE)
ON CONFLICT (codigo) DO NOTHING;

-- =====================================================
-- COMPLEMENTOS DE DTE
-- =====================================================

CREATE TABLE IF NOT EXISTS complementos_dte (
    id_complemento SERIAL PRIMARY KEY,
    id_venta INT REFERENCES ventas(id_venta),
    tipo_complemento VARCHAR(50) NOT NULL CHECK (tipo_complemento IN ('EXPORTACION', 'CAMBIARIA', 'ABONO', 'FACTURA_ESPECIAL', 'OTRO')),
    
    -- Datos del Complemento
    datos_complemento JSONB NOT NULL,
    
    -- Exportación
    incoterm VARCHAR(10),
    pais_destino VARCHAR(50),
    puerto_embarque VARCHAR(100),
    numero_exportador VARCHAR(50),
    
    -- Cambiaria
    numero_cambiaria VARCHAR(50),
    fecha_vencimiento DATE,
    
    -- Otros
    observaciones TEXT,
    
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_complementos_venta ON complementos_dte(id_venta);
CREATE INDEX idx_complementos_tipo ON complementos_dte(tipo_complemento);

COMMENT ON TABLE complementos_dte IS 'Complementos adicionales para DTE según tipo';

-- =====================================================
-- FRASES FEL (LEYENDAS)
-- =====================================================

CREATE TABLE IF NOT EXISTS frases_fel (
    id_frase SERIAL PRIMARY KEY,
    codigo_escenario VARCHAR(10) NOT NULL,
    tipo_frase INT NOT NULL,
    descripcion TEXT NOT NULL,
    activa BOOLEAN DEFAULT TRUE
);

INSERT INTO frases_fel (codigo_escenario, tipo_frase, descripcion) VALUES
('1', 1, 'Sujeto a pagos trimestrales'),
('2', 2, 'Exento de IVA'),
('3', 3, 'Resolución número [NUMERO] de fecha [FECHA]'),
('4', 4, 'Contribuyente Agropecuario Régimen Especial')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE frases_fel IS 'Frases y leyendas requeridas en DTE según escenario';

-- =====================================================
-- CONFIGURACIÓN FEL POR TIPO DE DTE
-- =====================================================

CREATE TABLE IF NOT EXISTS configuracion_fel_dte (
    id_config_dte SERIAL PRIMARY KEY,
    id_config_fel INT REFERENCES configuracion_fel(id_config_fel),
    tipo_dte VARCHAR(10) REFERENCES tipos_dte(codigo),
    
    -- Series Específicas
    serie_predeterminada VARCHAR(10),
    correlativo_actual BIGINT DEFAULT 0,
    
    -- Configuración
    requiere_autorizacion BOOLEAN DEFAULT FALSE,
    nivel_autorizacion INT DEFAULT 1,
    plantilla_xml TEXT,
    
    -- Frases Automáticas
    frases_automaticas INT[],
    
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_config_fel, tipo_dte)
);

CREATE INDEX idx_config_fel_dte_config ON configuracion_fel_dte(id_config_fel);
CREATE INDEX idx_config_fel_dte_tipo ON configuracion_fel_dte(tipo_dte);

-- =====================================================
-- COLA DE CERTIFICACIÓN FEL
-- =====================================================

CREATE TABLE IF NOT EXISTS cola_certificacion_fel (
    id_cola SERIAL PRIMARY KEY,
    id_venta INT REFERENCES ventas(id_venta),
    prioridad INT DEFAULT 5 CHECK (prioridad BETWEEN 1 AND 10),
    
    -- Estado
    estado VARCHAR(20) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'PROCESANDO', 'CERTIFICADO', 'ERROR', 'REINTENTO')),
    intentos INT DEFAULT 0,
    max_intentos INT DEFAULT 3,
    
    -- Tiempos
    fecha_encolado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_inicio_proceso TIMESTAMP,
    fecha_certificacion TIMESTAMP,
    tiempo_proceso_ms INT,
    
    -- Resultado
    exitoso BOOLEAN,
    codigo_error VARCHAR(50),
    mensaje_error TEXT,
    respuesta_sat JSONB,
    
    -- Próximo Intento
    proximo_intento TIMESTAMP,
    
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cola_fel_estado ON cola_certificacion_fel(estado);
CREATE INDEX idx_cola_fel_venta ON cola_certificacion_fel(id_venta);
CREATE INDEX idx_cola_fel_proximo_intento ON cola_certificacion_fel(proximo_intento);
CREATE INDEX idx_cola_fel_prioridad ON cola_certificacion_fel(prioridad DESC);

COMMENT ON TABLE cola_certificacion_fel IS 'Cola de procesamiento para certificación FEL con reintentos';

-- =====================================================
-- MEJORAS A AUDITORÍA FEL
-- =====================================================

-- Agregar campos a auditoria_documentos_fel
ALTER TABLE auditoria_documentos_fel ADD COLUMN IF NOT EXISTS tipo_dte VARCHAR(10);
ALTER TABLE auditoria_documentos_fel ADD COLUMN IF NOT EXISTS numero_intento INT DEFAULT 1;
ALTER TABLE auditoria_documentos_fel ADD COLUMN IF NOT EXISTS certificador VARCHAR(50);
ALTER TABLE auditoria_documentos_fel ADD COLUMN IF NOT EXISTS ambiente VARCHAR(20);

CREATE INDEX IF NOT EXISTS idx_auditoria_fel_tipo_dte ON auditoria_documentos_fel(tipo_dte);
CREATE INDEX IF NOT EXISTS idx_auditoria_fel_exitoso ON auditoria_documentos_fel(exitoso);

-- =====================================================
-- TRIGGER PARA ENCOLAR CERTIFICACIÓN
-- =====================================================

CREATE OR REPLACE FUNCTION encolar_certificacion_fel()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.requiere_certificacion = TRUE AND NEW.estado = 'PENDIENTE_CERTIFICACION' THEN
        INSERT INTO cola_certificacion_fel (id_venta, prioridad)
        VALUES (NEW.id_venta, 5)
        ON CONFLICT DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_encolar_certificacion ON ventas;
CREATE TRIGGER trigger_encolar_certificacion
AFTER INSERT OR UPDATE ON ventas
FOR EACH ROW EXECUTE FUNCTION encolar_certificacion_fel();

COMMENT ON FUNCTION encolar_certificacion_fel IS 'Encola automáticamente ventas que requieren certificación FEL';
