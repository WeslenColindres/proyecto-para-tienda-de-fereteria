-- Migration: 016_enhance_suppliers.sql
-- Description: Enhances suppliers module with financial fields, status management, and audit trails.

-- 1. Update proveedores table
ALTER TABLE proveedores 
ADD COLUMN IF NOT EXISTS estado_proveedor VARCHAR(20) DEFAULT 'activo',
ADD COLUMN IF NOT EXISTS creado_por INT REFERENCES usuarios(id_usuario),
ADD COLUMN IF NOT EXISTS actualizado_por INT REFERENCES usuarios(id_usuario),
ADD COLUMN IF NOT EXISTS version INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS plazo_credito_dias INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS condiciones_pago TEXT,
ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update existing records to have a valid status based on 'activo' boolean if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proveedores' AND column_name = 'activo') THEN
        UPDATE proveedores SET estado_proveedor = CASE WHEN activo = true THEN 'activo' ELSE 'inactivo' END WHERE estado_proveedor IS NULL OR estado_proveedor = 'activo';
    END IF;
END $$;

-- 2. Create or Update cuentas_por_pagar table
-- Drop existing table to ensure schema match (User requested replacement/update)
DROP TABLE IF EXISTS cuentas_por_pagar CASCADE;

CREATE TABLE cuentas_por_pagar (
    id_cxp SERIAL PRIMARY KEY,
    id_proveedor INT NOT NULL REFERENCES proveedores(id_proveedor),
    id_orden_compra INT REFERENCES ordenes_compra(id_orden_compra),
    numero_factura VARCHAR(50), -- Added back as it is critical
    fecha_emision DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    monto_original DECIMAL(12,2) NOT NULL,
    saldo_pendiente DECIMAL(12,2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagada', 'vencida', 'anulada')),
    observaciones TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create or Update productos_proveedores table (Plural to match convention)
CREATE TABLE IF NOT EXISTS productos_proveedores (
    id_producto INT NOT NULL REFERENCES productos(id_producto) ON DELETE CASCADE,
    id_proveedor INT NOT NULL REFERENCES proveedores(id_proveedor) ON DELETE CASCADE,
    precio_compra DECIMAL(12,2) NOT NULL,
    moneda VARCHAR(3) DEFAULT 'GTQ',
    plazo_entrega_dias INT DEFAULT 0,
    es_principal BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_producto, id_proveedor)
);

-- Handle potential existing table from 007 (if it was applied)
DO $$
BEGIN
    -- If table exists, ensure columns match our needs
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'productos_proveedores') THEN
        -- Add missing columns
        BEGIN
            ALTER TABLE productos_proveedores ADD COLUMN IF NOT EXISTS precio_compra DECIMAL(12,2);
            ALTER TABLE productos_proveedores ADD COLUMN IF NOT EXISTS moneda VARCHAR(3) DEFAULT 'GTQ';
            ALTER TABLE productos_proveedores ADD COLUMN IF NOT EXISTS plazo_entrega_dias INT DEFAULT 0;
            ALTER TABLE productos_proveedores ADD COLUMN IF NOT EXISTS es_principal BOOLEAN DEFAULT FALSE;
        EXCEPTION WHEN OTHERS THEN NULL; END;

        -- If precio_costo exists (from 007) and precio_compra is null, copy it
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'productos_proveedores' AND column_name = 'precio_costo') THEN
             UPDATE productos_proveedores SET precio_compra = precio_costo WHERE precio_compra IS NULL;
        END IF;
    END IF;
END $$;


-- 4. Update contactos_proveedor table
ALTER TABLE contactos_proveedor 
ADD COLUMN IF NOT EXISTS tipo_contacto VARCHAR(50) DEFAULT 'general',
ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;

-- 5. Create Indices
CREATE INDEX IF NOT EXISTS idx_proveedores_estado ON proveedores(estado_proveedor);
CREATE INDEX IF NOT EXISTS idx_proveedores_nit ON proveedores(nit);
CREATE INDEX IF NOT EXISTS idx_proveedores_ciudad ON proveedores(id_ciudad);
CREATE INDEX IF NOT EXISTS idx_proveedores_categoria ON proveedores(id_categoria_proveedor);

CREATE INDEX IF NOT EXISTS idx_cxp_proveedor_estado ON cuentas_por_pagar(id_proveedor, estado);
CREATE INDEX IF NOT EXISTS idx_cxp_vencimiento ON cuentas_por_pagar(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_cxp_estado ON cuentas_por_pagar(estado);
