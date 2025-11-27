-- Agregar campos a proveedores
ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS nombre_contacto VARCHAR(100);
ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS id_ciudad INT;
ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS id_categoria_proveedor INT;
ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS limite_credito DECIMAL(12,2) DEFAULT 0;
ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS saldo_pendiente DECIMAL(12,2) DEFAULT 0;
ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS dias_mora INT DEFAULT 0;
ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Tabla de ciudades
CREATE TABLE IF NOT EXISTS ciudades (
  id_ciudad SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  departamento VARCHAR(50),
  pais VARCHAR(50) DEFAULT 'Guatemala'
);

-- Tabla de categorías de proveedores
CREATE TABLE IF NOT EXISTS categorias_proveedor (
  id_categoria_proveedor SERIAL PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  activa BOOLEAN DEFAULT TRUE
);

-- Tabla de cuentas por pagar
CREATE TABLE IF NOT EXISTS cuentas_por_pagar (
  id_cuenta_por_pagar SERIAL PRIMARY KEY,
  id_orden_compra INT REFERENCES ordenes_compra(id_orden_compra),
  id_proveedor INT REFERENCES proveedores(id_proveedor),
  numero_factura VARCHAR(50) NOT NULL,
  fecha_factura DATE NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  monto_total DECIMAL(12,2) NOT NULL,
  monto_pagado DECIMAL(12,2) DEFAULT 0,
  monto_pendiente DECIMAL(12,2) NOT NULL,
  estado VARCHAR(20) DEFAULT 'pendiente',
  url_documento_factura TEXT,
  notas TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de pagos a proveedores
CREATE TABLE IF NOT EXISTS pagos_proveedor (
  id_pago SERIAL PRIMARY KEY,
  id_cuenta_por_pagar INT REFERENCES cuentas_por_pagar(id_cuenta_por_pagar),
  monto DECIMAL(12,2) NOT NULL,
  fecha_pago DATE NOT NULL,
  metodo_pago VARCHAR(50),
  numero_referencia VARCHAR(100),
  notas TEXT,
  id_usuario_registro INT REFERENCES usuarios(id_usuario),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agregar campos a ordenes_compra
ALTER TABLE ordenes_compra ADD COLUMN IF NOT EXISTS fecha_entrega_real DATE;
ALTER TABLE ordenes_compra ADD COLUMN IF NOT EXISTS id_usuario_recibe INT REFERENCES usuarios(id_usuario);
ALTER TABLE ordenes_compra ADD COLUMN IF NOT EXISTS fecha_recepcion TIMESTAMP;
ALTER TABLE ordenes_compra ADD COLUMN IF NOT EXISTS url_documento_factura TEXT;

-- Índices
CREATE INDEX IF NOT EXISTS idx_proveedores_deleted ON proveedores(deleted_at);
CREATE INDEX IF NOT EXISTS idx_proveedores_ciudad ON proveedores(id_ciudad);
CREATE INDEX IF NOT EXISTS idx_proveedores_categoria ON proveedores(id_categoria_proveedor);
CREATE INDEX IF NOT EXISTS idx_cuentas_estado ON cuentas_por_pagar(estado);
CREATE INDEX IF NOT EXISTS idx_cuentas_vencimiento ON cuentas_por_pagar(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_cuentas_proveedor ON cuentas_por_pagar(id_proveedor);

-- Datos iniciales
INSERT INTO ciudades (nombre, departamento) VALUES
  ('Guatemala', 'Guatemala'),
  ('Mixco', 'Guatemala'),
  ('Villa Nueva', 'Guatemala'),
  ('Antigua Guatemala', 'Sacatepéquez'),
  ('Quetzaltenango', 'Quetzaltenango')
ON CONFLICT DO NOTHING;

INSERT INTO categorias_proveedor (codigo, nombre) VALUES
  ('ALIMENTOS', 'Alimentos y Bebidas'),
  ('FERRETERIA', 'Ferretería y Construcción'),
  ('ELECTRONICA', 'Electrónica'),
  ('TEXTIL', 'Textiles y Ropa'),
  ('LIMPIEZA', 'Productos de Limpieza'),
  ('OFICINA', 'Artículos de Oficina')
ON CONFLICT (codigo) DO NOTHING;
