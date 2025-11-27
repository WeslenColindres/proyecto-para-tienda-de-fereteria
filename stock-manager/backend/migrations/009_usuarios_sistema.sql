-- =====================================================
-- MIGRACIÓN 009: SEPARACIÓN DE USUARIOS Y TRABAJADORES
-- =====================================================
-- Separa usuarios web (clientes) de trabajadores (empleados)

-- =====================================================
-- TRABAJADORES (EMPLEADOS)
-- =====================================================

CREATE TABLE IF NOT EXISTS trabajadores (
    id_trabajador SERIAL PRIMARY KEY,
    id_usuario INT UNIQUE REFERENCES usuarios(id_usuario),
    codigo_empleado VARCHAR(20) UNIQUE NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    dpi VARCHAR(20) UNIQUE,
    nit VARCHAR(20),
    fecha_nacimiento DATE,
    genero VARCHAR(10) CHECK (genero IN ('MASCULINO', 'FEMENINO', 'OTRO')),
    estado_civil VARCHAR(20),
    direccion TEXT,
    telefono VARCHAR(20),
    telefono_emergencia VARCHAR(20),
    contacto_emergencia VARCHAR(150),
    email_personal VARCHAR(100),
    
    -- Datos Laborales
    puesto VARCHAR(100) NOT NULL,
    departamento VARCHAR(100),
    id_sucursal INT REFERENCES sucursales(id_sucursal),
    fecha_ingreso DATE NOT NULL,
    fecha_egreso DATE,
    tipo_contrato VARCHAR(30) CHECK (tipo_contrato IN ('INDEFINIDO', 'PLAZO_FIJO', 'TEMPORAL', 'PRACTICANTE')),
    jornada VARCHAR(20) CHECK (jornada IN ('COMPLETA', 'PARCIAL', 'MIXTA')),
    
    -- Datos de Nómina
    salario_base DECIMAL(10,2),
    bonificacion_decreto DECIMAL(10,2) DEFAULT 250.00,
    comision_porcentaje DECIMAL(5,2) DEFAULT 0,
    cuenta_bancaria VARCHAR(50),
    banco VARCHAR(50),
    
    -- Estado
    activo BOOLEAN DEFAULT TRUE,
    motivo_baja TEXT,
    
    -- Auditoría
    foto_url TEXT,
    documentos_adjuntos JSONB,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trabajadores_usuario ON trabajadores(id_usuario);
CREATE INDEX idx_trabajadores_codigo ON trabajadores(codigo_empleado);
CREATE INDEX idx_trabajadores_sucursal ON trabajadores(id_sucursal);
CREATE INDEX idx_trabajadores_activo ON trabajadores(activo);

COMMENT ON TABLE trabajadores IS 'Empleados de la empresa con acceso al sistema';
COMMENT ON COLUMN trabajadores.bonificacion_decreto IS 'Bonificación Decreto 37-2001 (Q250.00)';

-- =====================================================
-- USUARIOS WEB (CLIENTES)
-- =====================================================

CREATE TABLE IF NOT EXISTS usuarios_web (
    id_usuario_web SERIAL PRIMARY KEY,
    id_usuario INT UNIQUE REFERENCES usuarios(id_usuario),
    id_cliente INT UNIQUE REFERENCES clientes(id_cliente),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP,
    verificado BOOLEAN DEFAULT FALSE,
    token_verificacion VARCHAR(255),
    fecha_verificacion TIMESTAMP,
    
    -- Preferencias
    recibir_notificaciones BOOLEAN DEFAULT TRUE,
    recibir_promociones BOOLEAN DEFAULT TRUE,
    idioma VARCHAR(5) DEFAULT 'es',
    
    -- Seguridad
    requiere_2fa BOOLEAN DEFAULT FALSE,
    secreto_2fa VARCHAR(255),
    
    -- Estado
    activo BOOLEAN DEFAULT TRUE,
    bloqueado BOOLEAN DEFAULT FALSE,
    motivo_bloqueo TEXT,
    fecha_bloqueo TIMESTAMP,
    
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuarios_web_usuario ON usuarios_web(id_usuario);
CREATE INDEX idx_usuarios_web_cliente ON usuarios_web(id_cliente);
CREATE INDEX idx_usuarios_web_activo ON usuarios_web(activo);

COMMENT ON TABLE usuarios_web IS 'Clientes con acceso al portal web';

-- =====================================================
-- PERFILES DE ACCESO MEJORADOS
-- =====================================================

CREATE TABLE IF NOT EXISTS perfiles_acceso (
    id_perfil SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    tipo_perfil VARCHAR(20) NOT NULL CHECK (tipo_perfil IN ('INTERNO', 'WEB', 'API', 'MOVIL')),
    nivel_acceso INT DEFAULT 1 CHECK (nivel_acceso BETWEEN 1 AND 10),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_perfiles_tipo ON perfiles_acceso(tipo_perfil);

COMMENT ON TABLE perfiles_acceso IS 'Perfiles de acceso granulares por tipo de usuario';
COMMENT ON COLUMN perfiles_acceso.nivel_acceso IS '1=Básico, 10=Administrador Total';

-- =====================================================
-- PERMISOS GRANULARES POR PERFIL
-- =====================================================

CREATE TABLE IF NOT EXISTS perfiles_permisos (
    id_perfil INT REFERENCES perfiles_acceso(id_perfil) ON DELETE CASCADE,
    id_permiso INT REFERENCES permisos(id_permiso) ON DELETE CASCADE,
    puede_crear BOOLEAN DEFAULT FALSE,
    puede_leer BOOLEAN DEFAULT TRUE,
    puede_actualizar BOOLEAN DEFAULT FALSE,
    puede_eliminar BOOLEAN DEFAULT FALSE,
    puede_exportar BOOLEAN DEFAULT FALSE,
    puede_imprimir BOOLEAN DEFAULT FALSE,
    restricciones JSONB,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_perfil, id_permiso)
);

COMMENT ON TABLE perfiles_permisos IS 'Permisos CRUD granulares por perfil';

-- =====================================================
-- ASIGNACIÓN DE PERFILES A USUARIOS
-- =====================================================

CREATE TABLE IF NOT EXISTS usuarios_perfiles (
    id_usuario INT REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    id_perfil INT REFERENCES perfiles_acceso(id_perfil) ON DELETE CASCADE,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (id_usuario, id_perfil)
);

CREATE INDEX idx_usuarios_perfiles_usuario ON usuarios_perfiles(id_usuario);
CREATE INDEX idx_usuarios_perfiles_perfil ON usuarios_perfiles(id_perfil);

-- =====================================================
-- HISTORIAL DE ACCESOS DETALLADO
-- =====================================================

CREATE TABLE IF NOT EXISTS historial_accesos (
    id_acceso BIGSERIAL PRIMARY KEY,
    id_usuario INT REFERENCES usuarios(id_usuario),
    tipo_usuario VARCHAR(20) CHECK (tipo_usuario IN ('TRABAJADOR', 'CLIENTE_WEB', 'API', 'SISTEMA')),
    accion VARCHAR(50) NOT NULL,
    modulo VARCHAR(50),
    recurso VARCHAR(100),
    metodo_http VARCHAR(10),
    url_solicitada TEXT,
    ip_address INET,
    user_agent TEXT,
    dispositivo VARCHAR(50),
    navegador VARCHAR(50),
    sistema_operativo VARCHAR(50),
    geolocalizacion JSONB,
    exitoso BOOLEAN NOT NULL,
    codigo_respuesta INT,
    mensaje_error TEXT,
    tiempo_respuesta_ms INT,
    datos_adicionales JSONB,
    fecha_acceso TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_historial_accesos_usuario ON historial_accesos(id_usuario);
CREATE INDEX idx_historial_accesos_fecha ON historial_accesos(fecha_acceso);
CREATE INDEX idx_historial_accesos_tipo ON historial_accesos(tipo_usuario);
CREATE INDEX idx_historial_accesos_exitoso ON historial_accesos(exitoso);
CREATE INDEX idx_historial_accesos_modulo ON historial_accesos(modulo);

COMMENT ON TABLE historial_accesos IS 'Historial detallado de todos los accesos al sistema';

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Perfiles de acceso predefinidos
INSERT INTO perfiles_acceso (nombre, descripcion, tipo_perfil, nivel_acceso) VALUES
('Administrador Sistema', 'Acceso total al sistema', 'INTERNO', 10),
('Gerente General', 'Acceso gerencial completo', 'INTERNO', 9),
('Contador', 'Acceso a módulos contables y financieros', 'INTERNO', 7),
('Vendedor', 'Acceso a punto de venta', 'INTERNO', 5),
('Bodeguero', 'Acceso a inventarios y compras', 'INTERNO', 5),
('Cliente Premium', 'Cliente con acceso web completo', 'WEB', 3),
('Cliente Regular', 'Cliente con acceso web básico', 'WEB', 2),
('API Externa', 'Acceso para integraciones', 'API', 6)
ON CONFLICT (nombre) DO NOTHING;

-- Migrar usuarios existentes a trabajadores
-- NOTA: Ejecutar manualmente después de revisar los datos
-- INSERT INTO trabajadores (id_usuario, codigo_empleado, nombres, apellidos, puesto, fecha_ingreso)
-- SELECT 
--     id_usuario,
--     'EMP-' || LPAD(id_usuario::TEXT, 4, '0'),
--     nombre_completo,
--     '',
--     CASE 
--         WHEN id_rol = 1 THEN 'Administrador'
--         WHEN id_rol = 2 THEN 'Vendedor'
--         WHEN id_rol = 3 THEN 'Bodeguero'
--         ELSE 'Empleado'
--     END,
--     COALESCE(fecha_creacion::DATE, CURRENT_DATE)
-- FROM usuarios
-- WHERE id_usuario NOT IN (SELECT id_usuario FROM trabajadores WHERE id_usuario IS NOT NULL);
