-- =====================================================
-- MIGRACIÓN 008: CONTABILIDAD AVANZADA
-- =====================================================
-- Implementa un sistema contable completo según normativas guatemaltecas

-- =====================================================
-- PLAN DE CUENTAS
-- =====================================================

CREATE TABLE IF NOT EXISTS plan_cuentas (
    id_cuenta SERIAL PRIMARY KEY,
    codigo_cuenta VARCHAR(20) UNIQUE NOT NULL,
    nombre_cuenta VARCHAR(150) NOT NULL,
    id_cuenta_padre INT REFERENCES plan_cuentas(id_cuenta),
    nivel INT NOT NULL CHECK (nivel BETWEEN 1 AND 5),
    tipo_cuenta VARCHAR(20) NOT NULL CHECK (tipo_cuenta IN ('ACTIVO', 'PASIVO', 'PATRIMONIO', 'INGRESO', 'EGRESO', 'COSTO')),
    naturaleza VARCHAR(10) NOT NULL CHECK (naturaleza IN ('DEUDORA', 'ACREEDORA')),
    acepta_movimiento BOOLEAN DEFAULT TRUE,
    requiere_centro_costo BOOLEAN DEFAULT FALSE,
    requiere_tercero BOOLEAN DEFAULT FALSE,
    activa BOOLEAN DEFAULT TRUE,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_plan_cuentas_codigo ON plan_cuentas(codigo_cuenta);
CREATE INDEX idx_plan_cuentas_padre ON plan_cuentas(id_cuenta_padre);
CREATE INDEX idx_plan_cuentas_tipo ON plan_cuentas(tipo_cuenta);

COMMENT ON TABLE plan_cuentas IS 'Catálogo de cuentas contables según normativas guatemaltecas';
COMMENT ON COLUMN plan_cuentas.nivel IS 'Nivel jerárquico: 1=Mayor, 2=Submay or, 3=Cuenta, 4=Subcuenta, 5=Auxiliar';
COMMENT ON COLUMN plan_cuentas.acepta_movimiento IS 'Si FALSE, es cuenta de agrupación solamente';

-- =====================================================
-- CENTROS DE COSTO
-- =====================================================

CREATE TABLE IF NOT EXISTS centros_costo (
    id_centro_costo SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    id_sucursal INT REFERENCES sucursales(id_sucursal),
    responsable VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_centros_costo_sucursal ON centros_costo(id_sucursal);

-- =====================================================
-- PERÍODOS CONTABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS periodos_contables (
    id_periodo SERIAL PRIMARY KEY,
    anio INT NOT NULL,
    mes INT NOT NULL CHECK (mes BETWEEN 1 AND 12),
    nombre VARCHAR(50) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'ABIERTO' CHECK (estado IN ('ABIERTO', 'CERRADO', 'BLOQUEADO')),
    fecha_cierre TIMESTAMP,
    id_usuario_cierre INT REFERENCES usuarios(id_usuario),
    observaciones TEXT,
    UNIQUE(anio, mes)
);

CREATE INDEX idx_periodos_anio_mes ON periodos_contables(anio, mes);
CREATE INDEX idx_periodos_estado ON periodos_contables(estado);

COMMENT ON TABLE periodos_contables IS 'Control de períodos fiscales mensuales';

-- =====================================================
-- ASIENTOS CONTABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS asientos_contables (
    id_asiento SERIAL PRIMARY KEY,
    numero_asiento VARCHAR(50) UNIQUE NOT NULL,
    id_periodo INT REFERENCES periodos_contables(id_periodo),
    fecha_asiento DATE NOT NULL,
    tipo_asiento VARCHAR(20) NOT NULL CHECK (tipo_asiento IN ('APERTURA', 'DIARIO', 'AJUSTE', 'CIERRE', 'AUTOMATICO')),
    concepto TEXT NOT NULL,
    documento_origen VARCHAR(30),
    id_documento_origen INT,
    numero_documento_origen VARCHAR(50),
    total_debe DECIMAL(14,2) NOT NULL DEFAULT 0,
    total_haber DECIMAL(14,2) NOT NULL DEFAULT 0,
    cuadrado BOOLEAN GENERATED ALWAYS AS (total_debe = total_haber) STORED,
    estado VARCHAR(20) DEFAULT 'BORRADOR' CHECK (estado IN ('BORRADOR', 'CONTABILIZADO', 'ANULADO')),
    id_usuario_crea INT REFERENCES usuarios(id_usuario),
    id_usuario_contabiliza INT REFERENCES usuarios(id_usuario),
    fecha_contabilizacion TIMESTAMP,
    id_usuario_anula INT REFERENCES usuarios(id_usuario),
    fecha_anulacion TIMESTAMP,
    motivo_anulacion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_asientos_periodo ON asientos_contables(id_periodo);
CREATE INDEX idx_asientos_fecha ON asientos_contables(fecha_asiento);
CREATE INDEX idx_asientos_tipo ON asientos_contables(tipo_asiento);
CREATE INDEX idx_asientos_estado ON asientos_contables(estado);
CREATE INDEX idx_asientos_documento ON asientos_contables(documento_origen, id_documento_origen);

COMMENT ON TABLE asientos_contables IS 'Encabezado de asientos contables';
COMMENT ON COLUMN asientos_contables.cuadrado IS 'Validación automática: debe = haber';

-- =====================================================
-- DETALLE DE ASIENTOS
-- =====================================================

CREATE TABLE IF NOT EXISTS detalle_asientos (
    id_detalle_asiento SERIAL PRIMARY KEY,
    id_asiento INT REFERENCES asientos_contables(id_asiento) ON DELETE CASCADE,
    numero_linea INT NOT NULL,
    id_cuenta INT REFERENCES plan_cuentas(id_cuenta),
    descripcion TEXT NOT NULL,
    debe DECIMAL(14,2) DEFAULT 0 CHECK (debe >= 0),
    haber DECIMAL(14,2) DEFAULT 0 CHECK (haber >= 0),
    id_centro_costo INT REFERENCES centros_costo(id_centro_costo),
    id_tercero INT,
    tipo_tercero VARCHAR(20),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_asiento, numero_linea),
    CHECK ((debe > 0 AND haber = 0) OR (haber > 0 AND debe = 0))
);

CREATE INDEX idx_detalle_asientos_asiento ON detalle_asientos(id_asiento);
CREATE INDEX idx_detalle_asientos_cuenta ON detalle_asientos(id_cuenta);
CREATE INDEX idx_detalle_asientos_centro_costo ON detalle_asientos(id_centro_costo);

COMMENT ON TABLE detalle_asientos IS 'Líneas de asientos contables (partida doble)';
COMMENT ON COLUMN detalle_asientos.tipo_tercero IS 'CLIENTE, PROVEEDOR, EMPLEADO, OTRO';

-- =====================================================
-- LIBROS CONTABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS libros_contables (
    id_libro SERIAL PRIMARY KEY,
    tipo_libro VARCHAR(50) NOT NULL CHECK (tipo_libro IN ('DIARIO', 'MAYOR', 'INVENTARIOS', 'BALANCES', 'ESTADOS_FINANCIEROS')),
    numero_autorizacion_sat VARCHAR(50) UNIQUE NOT NULL,
    fecha_autorizacion DATE NOT NULL,
    fecha_vencimiento DATE,
    numero_folios INT NOT NULL,
    folio_inicial INT NOT NULL,
    folio_final INT NOT NULL,
    folio_actual INT DEFAULT 0,
    id_sucursal INT REFERENCES sucursales(id_sucursal),
    activo BOOLEAN DEFAULT TRUE,
    fecha_habilitacion DATE,
    fecha_cierre DATE,
    observaciones TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_libros_tipo ON libros_contables(tipo_libro);
CREATE INDEX idx_libros_sucursal ON libros_contables(id_sucursal);

COMMENT ON TABLE libros_contables IS 'Registro de libros contables autorizados por SAT';

-- =====================================================
-- SALDOS CONTABLES (MATERIALIZADA)
-- =====================================================

CREATE TABLE IF NOT EXISTS saldos_contables (
    id_saldo SERIAL PRIMARY KEY,
    id_cuenta INT REFERENCES plan_cuentas(id_cuenta),
    id_periodo INT REFERENCES periodos_contables(id_periodo),
    saldo_inicial_debe DECIMAL(14,2) DEFAULT 0,
    saldo_inicial_haber DECIMAL(14,2) DEFAULT 0,
    movimientos_debe DECIMAL(14,2) DEFAULT 0,
    movimientos_haber DECIMAL(14,2) DEFAULT 0,
    saldo_final_debe DECIMAL(14,2) DEFAULT 0,
    saldo_final_haber DECIMAL(14,2) DEFAULT 0,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(id_cuenta, id_periodo)
);

CREATE INDEX idx_saldos_cuenta_periodo ON saldos_contables(id_cuenta, id_periodo);

COMMENT ON TABLE saldos_contables IS 'Saldos contables por cuenta y período (tabla materializada para performance)';

-- =====================================================
-- DATOS INICIALES - PLAN DE CUENTAS BÁSICO
-- =====================================================

-- Cuentas de Nivel 1 (Mayor)
INSERT INTO plan_cuentas (codigo_cuenta, nombre_cuenta, nivel, tipo_cuenta, naturaleza, acepta_movimiento) VALUES
('1', 'ACTIVO', 1, 'ACTIVO', 'DEUDORA', FALSE),
('2', 'PASIVO', 1, 'PASIVO', 'ACREEDORA', FALSE),
('3', 'PATRIMONIO', 1, 'PATRIMONIO', 'ACREEDORA', FALSE),
('4', 'INGRESOS', 1, 'INGRESO', 'ACREEDORA', FALSE),
('5', 'COSTOS', 1, 'COSTO', 'DEUDORA', FALSE),
('6', 'GASTOS', 1, 'EGRESO', 'DEUDORA', FALSE)
ON CONFLICT (codigo_cuenta) DO NOTHING;

-- Cuentas de Nivel 2 (Activo)
INSERT INTO plan_cuentas (codigo_cuenta, nombre_cuenta, id_cuenta_padre, nivel, tipo_cuenta, naturaleza, acepta_movimiento) VALUES
('1.1', 'ACTIVO CORRIENTE', (SELECT id_cuenta FROM plan_cuentas WHERE codigo_cuenta = '1'), 2, 'ACTIVO', 'DEUDORA', FALSE),
('1.2', 'ACTIVO NO CORRIENTE', (SELECT id_cuenta FROM plan_cuentas WHERE codigo_cuenta = '1'), 2, 'ACTIVO', 'DEUDORA', FALSE)
ON CONFLICT (codigo_cuenta) DO NOTHING;

-- Cuentas de Nivel 3 (Activo Corriente)
INSERT INTO plan_cuentas (codigo_cuenta, nombre_cuenta, id_cuenta_padre, nivel, tipo_cuenta, naturaleza, acepta_movimiento) VALUES
('1.1.01', 'CAJA Y BANCOS', (SELECT id_cuenta FROM plan_cuentas WHERE codigo_cuenta = '1.1'), 3, 'ACTIVO', 'DEUDORA', FALSE),
('1.1.02', 'CUENTAS POR COBRAR', (SELECT id_cuenta FROM plan_cuentas WHERE codigo_cuenta = '1.1'), 3, 'ACTIVO', 'DEUDORA', FALSE),
('1.1.03', 'INVENTARIOS', (SELECT id_cuenta FROM plan_cuentas WHERE codigo_cuenta = '1.1'), 3, 'ACTIVO', 'DEUDORA', FALSE),
('1.1.04', 'IVA POR COBRAR', (SELECT id_cuenta FROM plan_cuentas WHERE codigo_cuenta = '1.1'), 3, 'ACTIVO', 'DEUDORA', TRUE)
ON CONFLICT (codigo_cuenta) DO NOTHING;

-- Cuentas de Nivel 4 (Detalle)
INSERT INTO plan_cuentas (codigo_cuenta, nombre_cuenta, id_cuenta_padre, nivel, tipo_cuenta, naturaleza, acepta_movimiento, requiere_tercero) VALUES
('1.1.01.001', 'CAJA GENERAL', (SELECT id_cuenta FROM plan_cuentas WHERE codigo_cuenta = '1.1.01'), 4, 'ACTIVO', 'DEUDORA', TRUE, FALSE),
('1.1.01.002', 'BANCOS CUENTA CORRIENTE', (SELECT id_cuenta FROM plan_cuentas WHERE codigo_cuenta = '1.1.01'), 4, 'ACTIVO', 'DEUDORA', TRUE, FALSE),
('1.1.02.001', 'CLIENTES NACIONALES', (SELECT id_cuenta FROM plan_cuentas WHERE codigo_cuenta = '1.1.02'), 4, 'ACTIVO', 'DEUDORA', TRUE, TRUE),
('1.1.03.001', 'INVENTARIO DE MERCADERÍAS', (SELECT id_cuenta FROM plan_cuentas WHERE codigo_cuenta = '1.1.03'), 4, 'ACTIVO', 'DEUDORA', TRUE, FALSE)
ON CONFLICT (codigo_cuenta) DO NOTHING;

-- Cuentas de Nivel 2 (Pasivo)
INSERT INTO plan_cuentas (codigo_cuenta, nombre_cuenta, id_cuenta_padre, nivel, tipo_cuenta, naturaleza, acepta_movimiento) VALUES
('2.1', 'PASIVO CORRIENTE', (SELECT id_cuenta FROM plan_cuentas WHERE codigo_cuenta = '2'), 2, 'PASIVO', 'ACREEDORA', FALSE),
('2.2', 'PASIVO NO CORRIENTE', (SELECT id_cuenta FROM plan_cuentas WHERE codigo_cuenta = '2'), 2, 'PASIVO', 'ACREEDORA', FALSE)
ON CONFLICT (codigo_cuenta) DO NOTHING;

-- Cuentas de Nivel 3 (Pasivo Corriente)
INSERT INTO plan_cuentas (codigo_cuenta, nombre_cuenta, id_cuenta_padre, nivel, tipo_cuenta, naturaleza, acepta_movimiento) VALUES
('2.1.01', 'CUENTAS POR PAGAR', (SELECT id_cuenta FROM plan_cuentas WHERE codigo_cuenta = '2.1'), 3, 'PASIVO', 'ACREEDORA', FALSE),
('2.1.02', 'IVA POR PAGAR', (SELECT id_cuenta FROM plan_cuentas WHERE codigo_cuenta = '2.1'), 3, 'PASIVO', 'ACREEDORA', TRUE),
('2.1.03', 'ISR POR PAGAR', (SELECT id_cuenta FROM plan_cuentas WHERE codigo_cuenta = '2.1'), 3, 'PASIVO', 'ACREEDORA', TRUE)
ON CONFLICT (codigo_cuenta) DO NOTHING;

-- Cuentas de Nivel 4 (Pasivo Detalle)
INSERT INTO plan_cuentas (codigo_cuenta, nombre_cuenta, id_cuenta_padre, nivel, tipo_cuenta, naturaleza, acepta_movimiento, requiere_tercero) VALUES
('2.1.01.001', 'PROVEEDORES NACIONALES', (SELECT id_cuenta FROM plan_cuentas WHERE codigo_cuenta = '2.1.01'), 4, 'PASIVO', 'ACREEDORA', TRUE, TRUE)
ON CONFLICT (codigo_cuenta) DO NOTHING;

-- Cuentas de Patrimonio
INSERT INTO plan_cuentas (codigo_cuenta, nombre_cuenta, id_cuenta_padre, nivel, tipo_cuenta, naturaleza, acepta_movimiento) VALUES
('3.1', 'CAPITAL SOCIAL', (SELECT id_cuenta FROM plan_cuentas WHERE codigo_cuenta = '3'), 2, 'PATRIMONIO', 'ACREEDORA', TRUE),
('3.2', 'UTILIDADES RETENIDAS', (SELECT id_cuenta FROM plan_cuentas WHERE codigo_cuenta = '3'), 2, 'PATRIMONIO', 'ACREEDORA', TRUE),
('3.3', 'UTILIDAD DEL EJERCICIO', (SELECT id_cuenta FROM plan_cuentas WHERE codigo_cuenta = '3'), 2, 'PATRIMONIO', 'ACREEDORA', TRUE)
ON CONFLICT (codigo_cuenta) DO NOTHING;

-- Cuentas de Ingresos
INSERT INTO plan_cuentas (codigo_cuenta, nombre_cuenta, id_cuenta_padre, nivel, tipo_cuenta, naturaleza, acepta_movimiento) VALUES
('4.1', 'INGRESOS OPERACIONALES', (SELECT id_cuenta FROM plan_cuentas WHERE codigo_cuenta = '4'), 2, 'INGRESO', 'ACREEDORA', FALSE),
('4.1.01', 'VENTAS', (SELECT id_cuenta FROM plan_cuentas WHERE codigo_cuenta = '4.1'), 3, 'INGRESO', 'ACREEDORA', TRUE)
ON CONFLICT (codigo_cuenta) DO NOTHING;

-- Cuentas de Costos
INSERT INTO plan_cuentas (codigo_cuenta, nombre_cuenta, id_cuenta_padre, nivel, tipo_cuenta, naturaleza, acepta_movimiento) VALUES
('5.1', 'COSTO DE VENTAS', (SELECT id_cuenta FROM plan_cuentas WHERE codigo_cuenta = '5'), 2, 'COSTO', 'DEUDORA', TRUE)
ON CONFLICT (codigo_cuenta) DO NOTHING;

-- Cuentas de Gastos
INSERT INTO plan_cuentas (codigo_cuenta, nombre_cuenta, id_cuenta_padre, nivel, tipo_cuenta, naturaleza, acepta_movimiento) VALUES
('6.1', 'GASTOS DE ADMINISTRACIÓN', (SELECT id_cuenta FROM plan_cuentas WHERE codigo_cuenta = '6'), 2, 'EGRESO', 'DEUDORA', FALSE),
('6.2', 'GASTOS DE VENTA', (SELECT id_cuenta FROM plan_cuentas WHERE codigo_cuenta = '6'), 2, 'EGRESO', 'DEUDORA', FALSE),
('6.1.01', 'SUELDOS Y SALARIOS', (SELECT id_cuenta FROM plan_cuentas WHERE codigo_cuenta = '6.1'), 3, 'EGRESO', 'DEUDORA', TRUE),
('6.1.02', 'SERVICIOS BÁSICOS', (SELECT id_cuenta FROM plan_cuentas WHERE codigo_cuenta = '6.1'), 3, 'EGRESO', 'DEUDORA', TRUE)
ON CONFLICT (codigo_cuenta) DO NOTHING;

-- =====================================================
-- TRIGGER PARA ACTUALIZAR TOTALES DE ASIENTO
-- =====================================================

CREATE OR REPLACE FUNCTION actualizar_totales_asiento()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE asientos_contables
    SET 
        total_debe = (SELECT COALESCE(SUM(debe), 0) FROM detalle_asientos WHERE id_asiento = NEW.id_asiento),
        total_haber = (SELECT COALESCE(SUM(haber), 0) FROM detalle_asientos WHERE id_asiento = NEW.id_asiento),
        fecha_modificacion = CURRENT_TIMESTAMP
    WHERE id_asiento = NEW.id_asiento;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_totales_asiento ON detalle_asientos;
CREATE TRIGGER trigger_actualizar_totales_asiento
AFTER INSERT OR UPDATE OR DELETE ON detalle_asientos
FOR EACH ROW EXECUTE FUNCTION actualizar_totales_asiento();

COMMENT ON FUNCTION actualizar_totales_asiento IS 'Actualiza automáticamente los totales debe/haber del asiento';
