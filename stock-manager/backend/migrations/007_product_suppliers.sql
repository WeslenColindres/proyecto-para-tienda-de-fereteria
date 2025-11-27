-- Tabla para relación muchos a muchos entre productos y proveedores con precios diferenciados
CREATE TABLE IF NOT EXISTS productos_proveedores (
  id_producto INT REFERENCES productos(id_producto) ON DELETE CASCADE,
  id_proveedor INT REFERENCES proveedores(id_proveedor) ON DELETE CASCADE,
  codigo_producto_proveedor VARCHAR(50),
  precio_costo DECIMAL(12,2) NOT NULL,
  moneda VARCHAR(3) DEFAULT 'GTQ',
  es_proveedor_principal BOOLEAN DEFAULT FALSE,
  fecha_ultima_compra DATE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_producto, id_proveedor)
);

CREATE INDEX IF NOT EXISTS idx_prod_prov_producto ON productos_proveedores(id_producto);
CREATE INDEX IF NOT EXISTS idx_prod_prov_proveedor ON productos_proveedores(id_proveedor);

-- Migrar datos existentes: Si un producto tiene id_proveedor_principal, crear registro en la nueva tabla
INSERT INTO productos_proveedores (id_producto, id_proveedor, precio_costo, es_proveedor_principal)
SELECT 
    p.id_producto, 
    p.id_proveedor_principal, 
    0.00, -- Precio costo inicial en 0 si no se conoce
    TRUE
FROM productos p
WHERE p.id_proveedor_principal IS NOT NULL
ON CONFLICT (id_producto, id_proveedor) DO NOTHING;
