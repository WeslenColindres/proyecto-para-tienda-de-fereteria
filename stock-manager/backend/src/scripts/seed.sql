-- =====================================================
-- DATOS DE PRUEBA PARA ERP FERRETERÍA
-- =====================================================
-- Ejecutar DESPUÉS de init.sql y migrations

-- Limpiar datos existentes (comentar si no quieres borrar)
-- TRUNCATE TABLE stock_producto, precios_producto, productos, categorias, proveedores, clientes, usuarios, sucursales, empresa RESTART IDENTITY CASCADE;

-- 1. Empresa y Sucursales
INSERT INTO empresa (nombre_comercial, razon_social, nit, telefono, email) VALUES
('Ferretería La Central', 'Inversiones Ferreteras S.A.', '1234567-8', '2222-3333', 'contacto@ferreterialacentral.com')
ON CONFLICT (nit) DO NOTHING;

INSERT INTO sucursales (id_empresa, codigo_sucursal, nombre, direccion, es_matriz) VALUES
(1, 'SUC-001', 'Central', 'Zona 1, Ciudad de Guatemala', TRUE),
(1, 'SUC-002', 'Norte', 'Zona 18, Ciudad de Guatemala', FALSE)
ON CONFLICT (codigo_sucursal) DO NOTHING;

-- 2. Usuarios
-- Password: admin123 y vendedor123 (hasheados con bcrypt)
INSERT INTO usuarios (username, password_hash, email, nombre_completo, id_rol) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin@ferreteria.com', 'Administrador del Sistema', 1),
('vendedor', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'vendedor@ferreteria.com', 'Juan Vendedor', 2)
ON CONFLICT (username) DO NOTHING;

-- 3. Proveedores
INSERT INTO proveedores (nit, nombre, nombre_comercial, email, telefono, direccion, dias_entrega) VALUES
('111111-1', 'Distribuidora Ferretera S.A.', 'Disfer', 'ventas@disfer.com', '2333-4444', 'Zona 12', 3),
('222222-2', 'Cementos Progreso S.A.', 'Cempro', 'pedidos@cempro.com', '2444-5555', 'Zona 6', 2),
('333333-3', 'Herramientas Stanley', 'Stanley', 'latam@stanley.com', '2555-6666', 'Zona 10', 7),
('444444-4', 'Pinturas Sherwin Williams', 'Sherwin', 'guatemala@sherwin.com', '2666-7777', 'Zona 4', 5),
('555555-5', 'Aceros de Guatemala', 'Aceros GT', 'ventas@acerosgt.com', '2777-8888', 'Zona 12', 4)
ON CONFLICT (nit) DO NOTHING;

-- 4. Categorías
INSERT INTO categorias (nombre, descripcion) VALUES
('Herramientas Manuales', 'Martillos, destornilladores, llaves, etc.'),
('Materiales de Construcción', 'Cemento, arena, cal, block'),
('Plomería', 'Tubos PVC, grifos, accesorios'),
('Eléctrico', 'Cables, tomacorrientes, bombillas'),
('Pintura', 'Pinturas, brochas, rodillos')
ON CONFLICT (nombre) DO NOTHING;

-- 5. Productos
INSERT INTO productos (sku, codigo_barras, nombre, descripcion, id_categoria, id_unidad_medida, id_proveedor_principal) VALUES
('HER-001', '7400000000001', 'Martillo de Uña 16oz', 'Martillo mango de madera', 1, 1, 3),
('HER-002', '7400000000002', 'Destornillador Phillips #2', 'Punta magnética', 1, 1, 3),
('HER-003', '7400000000003', 'Llave Inglesa 12"', 'Ajustable cromada', 1, 1, 3),
('MAT-001', '7400000000004', 'Cemento UGC 4060psi', 'Saco de 42.5kg', 2, 1, 2),
('MAT-002', '7400000000005', 'Cal Hidratada', 'Saco de 20kg', 2, 1, 2),
('PLO-001', '7400000000006', 'Tubo PVC 1/2"', 'Presión 160psi', 3, 4, 1),
('PLO-002', '7400000000007', 'Codo PVC 1/2"', '90 grados', 3, 1, 1),
('ELE-001', '7400000000008', 'Cable THW #12', 'Por metro', 4, 4, 1),
('PIN-001', '7400000000009', 'Pintura Latex Blanco', 'Cubeta 5 galones', 5, 1, 4)
ON CONFLICT (sku) DO NOTHING;

-- 6. Precios
INSERT INTO precios_producto (id_producto, tipo_precio, precio, fecha_vigencia_inicio) VALUES
(1, 'PÚBLICO', 45.00, '2024-01-01'),
(1, 'MAYORISTA', 40.00, '2024-01-01'),
(2, 'PÚBLICO', 25.00, '2024-01-01'),
(3, 'PÚBLICO', 85.00, '2024-01-01'),
(4, 'PÚBLICO', 85.00, '2024-01-01'),
(4, 'MAYORISTA', 82.00, '2024-01-01'),
(5, 'PÚBLICO', 35.00, '2024-01-01'),
(6, 'PÚBLICO', 12.50, '2024-01-01'),
(7, 'PÚBLICO', 3.50, '2024-01-01'),
(8, 'PÚBLICO', 4.25, '2024-01-01'),
(9, 'PÚBLICO', 285.00, '2024-01-01')
ON CONFLICT (id_producto, tipo_precio, fecha_vigencia_inicio) DO NOTHING;

-- 7. Stock Inicial
INSERT INTO stock_producto (id_producto, id_sucursal, cantidad_disponible) VALUES
(1, 1, 50),  -- Martillos en Central
(2, 1, 30),  -- Destornilladores en Central
(3, 1, 20),  -- Llaves en Central
(4, 1, 100), -- Cemento en Central
(4, 2, 50),  -- Cemento en Norte
(5, 1, 80),  -- Cal en Central
(6, 1, 200), -- Tubos en Central
(7, 1, 150), -- Codos en Central
(8, 1, 500), -- Cable en Central
(9, 1, 25)   -- Pintura en Central
ON CONFLICT (id_producto, id_sucursal) DO NOTHING;

-- 8. Clientes
INSERT INTO clientes (nit, nombre, id_tipo_cliente, email, telefono, limite_credito, dias_credito) VALUES
('CF', 'Consumidor Final', 1, NULL, NULL, 0, 0),
('987654-3', 'Constructora El Progreso', 2, 'compras@elprogreso.com', '5555-1234', 50000, 30),
('456789-0', 'Juan Pérez', 1, 'juan.perez@gmail.com', '4444-0000', 1000, 15),
('321654-9', 'Inversiones Modernas S.A.', 2, 'ventas@inversiones.com', '3333-2222', 75000, 45)
ON CONFLICT (nit) DO NOTHING;

-- 9. Notificaciones
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    priority VARCHAR(20) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO notifications (title, message, type, priority, is_read) VALUES
('Stock Bajo: Martillo', 'El producto Martillo de Uña 16oz ha llegado a su punto de reorden.', 'inventory', 'warning', FALSE),
('Stock Bajo: Pintura', 'Quedan solo 25 cubetas de Pintura Latex Blanco.', 'inventory', 'warning', FALSE),
('Nuevo Pedido Web', 'Se ha recibido un nuevo pedido #12345.', 'sale', 'info', FALSE),
('Proveedor Registrado', 'Se agregó el proveedor Aceros de Guatemala.', 'supplier', 'success', TRUE),
('Sistema Actualizado', 'El sistema se actualizó a la versión 1.2.0.', 'system', 'info', TRUE)
ON CONFLICT DO NOTHING;
