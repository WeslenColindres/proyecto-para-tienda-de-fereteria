-- =====================================================
-- MIGRACIÓN 014: VISTAS CONTABLES Y DE REPORTERÍA
-- =====================================================
-- Vistas optimizadas para reportes contables y gerenciales

-- =====================================================
-- VISTA: BALANCE GENERAL
-- =====================================================

CREATE OR REPLACE VIEW vista_balance_general AS
WITH saldos_cuentas AS (
    SELECT 
        pc.id_cuenta,
        pc.codigo_cuenta,
        pc.nombre_cuenta,
        pc.tipo_cuenta,
        pc.naturaleza,
        pc.nivel,
        COALESCE(SUM(CASE WHEN da.debe > 0 THEN da.debe ELSE 0 END), 0) AS total_debe,
        COALESCE(SUM(CASE WHEN da.haber > 0 THEN da.haber ELSE 0 END), 0) AS total_haber
    FROM plan_cuentas pc
    LEFT JOIN detalle_asientos da ON pc.id_cuenta = da.id_cuenta
    LEFT JOIN asientos_contables ac ON da.id_asiento = ac.id_asiento
    WHERE ac.estado = 'CONTABILIZADO'
    GROUP BY pc.id_cuenta, pc.codigo_cuenta, pc.nombre_cuenta, pc.tipo_cuenta, pc.naturaleza, pc.nivel
)
SELECT 
    codigo_cuenta,
    nombre_cuenta,
    tipo_cuenta,
    nivel,
    CASE 
        WHEN naturaleza = 'DEUDORA' THEN total_debe - total_haber
        WHEN naturaleza = 'ACREEDORA' THEN total_haber - total_debe
    END AS saldo,
    naturaleza
FROM saldos_cuentas
WHERE tipo_cuenta IN ('ACTIVO', 'PASIVO', 'PATRIMONIO')
ORDER BY codigo_cuenta;

COMMENT ON VIEW vista_balance_general IS 'Balance General con saldos de activos, pasivos y patrimonio';

-- =====================================================
-- VISTA: ESTADO DE RESULTADOS
-- =====================================================

CREATE OR REPLACE VIEW vista_estado_resultados AS
WITH saldos_cuentas AS (
    SELECT 
        pc.id_cuenta,
        pc.codigo_cuenta,
        pc.nombre_cuenta,
        pc.tipo_cuenta,
        COALESCE(SUM(CASE WHEN da.debe > 0 THEN da.debe ELSE 0 END), 0) AS total_debe,
        COALESCE(SUM(CASE WHEN da.haber > 0 THEN da.haber ELSE 0 END), 0) AS total_haber
    FROM plan_cuentas pc
    LEFT JOIN detalle_asientos da ON pc.id_cuenta = da.id_cuenta
    LEFT JOIN asientos_contables ac ON da.id_asiento = ac.id_asiento
    WHERE ac.estado = 'CONTABILIZADO'
    GROUP BY pc.id_cuenta, pc.codigo_cuenta, pc.nombre_cuenta, pc.tipo_cuenta
)
SELECT 
    codigo_cuenta,
    nombre_cuenta,
    tipo_cuenta,
    CASE 
        WHEN tipo_cuenta = 'INGRESO' THEN total_haber - total_debe
        WHEN tipo_cuenta IN ('COSTO', 'EGRESO') THEN total_debe - total_haber
    END AS monto
FROM saldos_cuentas
WHERE tipo_cuenta IN ('INGRESO', 'COSTO', 'EGRESO')
ORDER BY tipo_cuenta, codigo_cuenta;

COMMENT ON VIEW vista_estado_resultados IS 'Estado de Resultados con ingresos, costos y gastos';

-- =====================================================
-- VISTA: FLUJO DE EFECTIVO
-- =====================================================

CREATE OR REPLACE VIEW vista_flujo_efectivo AS
SELECT 
    ac.fecha_asiento,
    ac.numero_asiento,
    ac.concepto,
    da.descripcion,
    CASE 
        WHEN da.debe > 0 THEN 'ENTRADA'
        WHEN da.haber > 0 THEN 'SALIDA'
    END AS tipo_movimiento,
    COALESCE(da.debe, 0) AS entrada,
    COALESCE(da.haber, 0) AS salida,
    pc.nombre_cuenta
FROM detalle_asientos da
JOIN asientos_contables ac ON da.id_asiento = ac.id_asiento
JOIN plan_cuentas pc ON da.id_cuenta = pc.id_cuenta
WHERE pc.codigo_cuenta LIKE '1.1.01%'  -- Cuentas de caja y bancos
AND ac.estado = 'CONTABILIZADO'
ORDER BY ac.fecha_asiento DESC, ac.numero_asiento;

COMMENT ON VIEW vista_flujo_efectivo IS 'Flujo de efectivo basado en movimientos de caja y bancos';

-- =====================================================
-- VISTA: INVENTARIO VALORIZADO
-- =====================================================

CREATE OR REPLACE VIEW vista_inventario_valorizado AS
SELECT 
    p.id_producto,
    p.sku,
    p.nombre,
    c.nombre AS categoria,
    s.nombre AS sucursal,
    sp.cantidad_disponible,
    sp.cantidad_reservada,
    sp.cantidad_transito,
    sp.cantidad_disponible + sp.cantidad_reservada + sp.cantidad_transito AS cantidad_total,
    -- Costo promedio ponderado
    COALESCE(
        (SELECT AVG(k.costo_unitario) 
         FROM kardex_inventario k 
         WHERE k.id_producto = p.id_producto 
         AND k.id_sucursal = sp.id_sucursal
         AND k.costo_unitario > 0
         LIMIT 100), 
        0
    ) AS costo_promedio,
    sp.cantidad_disponible * COALESCE(
        (SELECT AVG(k.costo_unitario) 
         FROM kardex_inventario k 
         WHERE k.id_producto = p.id_producto 
         AND k.id_sucursal = sp.id_sucursal
         AND k.costo_unitario > 0
         LIMIT 100), 
        0
    ) AS valor_inventario
FROM productos p
JOIN stock_producto sp ON p.id_producto = sp.id_producto
JOIN sucursales s ON sp.id_sucursal = s.id_sucursal
LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
WHERE p.es_inventariable = TRUE
ORDER BY valor_inventario DESC;

COMMENT ON VIEW vista_inventario_valorizado IS 'Inventario valorizado con costo promedio ponderado';

-- =====================================================
-- VISTA: CUENTAS POR COBRAR
-- =====================================================

CREATE OR REPLACE VIEW vista_cuentas_por_cobrar AS
SELECT 
    v.id_venta,
    v.numero_documento,
    v.fecha_venta,
    v.fecha_vencimiento,
    CURRENT_DATE - v.fecha_vencimiento AS dias_vencido,
    c.nit,
    c.nombre AS cliente,
    c.telefono,
    c.email,
    v.total_final,
    COALESCE(SUM(pv.monto), 0) AS total_pagado,
    v.total_final - COALESCE(SUM(pv.monto), 0) AS saldo_pendiente,
    CASE 
        WHEN v.fecha_vencimiento IS NULL THEN 'SIN_VENCIMIENTO'
        WHEN CURRENT_DATE <= v.fecha_vencimiento THEN 'AL_DIA'
        WHEN CURRENT_DATE - v.fecha_vencimiento <= 30 THEN 'VENCIDO_30'
        WHEN CURRENT_DATE - v.fecha_vencimiento <= 60 THEN 'VENCIDO_60'
        WHEN CURRENT_DATE - v.fecha_vencimiento <= 90 THEN 'VENCIDO_90'
        ELSE 'VENCIDO_MAS_90'
    END AS estado_cartera
FROM ventas v
LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
LEFT JOIN pagos_venta pv ON v.id_venta = pv.id_venta AND pv.estado = 'ACREDITADO'
WHERE v.estado IN ('CERTIFICADA', 'CONTABILIZADA')
GROUP BY v.id_venta, v.numero_documento, v.fecha_venta, v.fecha_vencimiento, 
         c.nit, c.nombre, c.telefono, c.email, v.total_final
HAVING v.total_final - COALESCE(SUM(pv.monto), 0) > 0
ORDER BY dias_vencido DESC;

COMMENT ON VIEW vista_cuentas_por_cobrar IS 'Estado de cuentas por cobrar con antigüedad de saldos';

-- =====================================================
-- VISTA: ANÁLISIS DE RENTABILIDAD POR PRODUCTO
-- =====================================================

CREATE OR REPLACE VIEW vista_rentabilidad_productos AS
SELECT 
    p.id_producto,
    p.sku,
    p.nombre,
    c.nombre AS categoria,
    COUNT(DISTINCT dv.id_venta) AS numero_ventas,
    SUM(dv.cantidad) AS cantidad_vendida,
    SUM(dv.total_linea) AS ingresos_totales,
    SUM(dv.cantidad * dv.costo_unitario_momento) AS costos_totales,
    SUM(dv.total_linea) - SUM(dv.cantidad * dv.costo_unitario_momento) AS utilidad_bruta,
    CASE 
        WHEN SUM(dv.total_linea) > 0 THEN
            ((SUM(dv.total_linea) - SUM(dv.cantidad * dv.costo_unitario_momento)) / SUM(dv.total_linea) * 100)
        ELSE 0 
    END AS margen_porcentaje,
    AVG(dv.precio_unitario) AS precio_promedio_venta,
    AVG(dv.costo_unitario_momento) AS costo_promedio
FROM productos p
LEFT JOIN detalle_ventas dv ON p.id_producto = dv.id_producto
LEFT JOIN ventas v ON dv.id_venta = v.id_venta
LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
WHERE v.estado = 'CERTIFICADA'
GROUP BY p.id_producto, p.sku, p.nombre, c.nombre
HAVING SUM(dv.cantidad) > 0
ORDER BY utilidad_bruta DESC;

COMMENT ON VIEW vista_rentabilidad_productos IS 'Análisis de rentabilidad por producto';

-- =====================================================
-- VISTA: VENTAS POR VENDEDOR
-- =====================================================

CREATE OR REPLACE VIEW vista_ventas_por_vendedor AS
SELECT 
    t.id_trabajador,
    t.codigo_empleado,
    t.nombres || ' ' || t.apellidos AS vendedor,
    COUNT(v.id_venta) AS numero_ventas,
    SUM(v.total_final) AS total_vendido,
    AVG(v.total_final) AS ticket_promedio,
    SUM(v.total_final) * COALESCE(t.comision_porcentaje, 0) / 100 AS comisiones_generadas,
    EXTRACT(YEAR FROM v.fecha_venta) AS anio,
    EXTRACT(MONTH FROM v.fecha_venta) AS mes
FROM trabajadores t
LEFT JOIN usuarios u ON t.id_usuario = u.id_usuario
LEFT JOIN ventas v ON u.id_usuario = v.id_usuario_vendedor
WHERE v.estado = 'CERTIFICADA'
GROUP BY t.id_trabajador, t.codigo_empleado, t.nombres, t.apellidos, t.comision_porcentaje,
         EXTRACT(YEAR FROM v.fecha_venta), EXTRACT(MONTH FROM v.fecha_venta)
ORDER BY total_vendido DESC;

COMMENT ON VIEW vista_ventas_por_vendedor IS 'Análisis de ventas y comisiones por vendedor';

-- =====================================================
-- VISTA: PRODUCTOS MÁS VENDIDOS
-- =====================================================

CREATE OR REPLACE VIEW vista_productos_mas_vendidos AS
SELECT 
    p.id_producto,
    p.sku,
    p.nombre,
    c.nombre AS categoria,
    SUM(dv.cantidad) AS cantidad_total_vendida,
    COUNT(DISTINCT v.id_venta) AS numero_transacciones,
    SUM(dv.total_linea) AS ingresos_totales,
    AVG(dv.precio_unitario) AS precio_promedio,
    MAX(v.fecha_venta) AS ultima_venta
FROM productos p
JOIN detalle_ventas dv ON p.id_producto = dv.id_producto
JOIN ventas v ON dv.id_venta = v.id_venta
LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
WHERE v.estado = 'CERTIFICADA'
AND v.fecha_venta >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY p.id_producto, p.sku, p.nombre, c.nombre
ORDER BY cantidad_total_vendida DESC
LIMIT 50;

COMMENT ON VIEW vista_productos_mas_vendidos IS 'Top 50 productos más vendidos en los últimos 90 días';

-- =====================================================
-- VISTA: RESUMEN DE VENTAS DIARIAS
-- =====================================================

CREATE OR REPLACE VIEW vista_resumen_ventas_diarias AS
SELECT 
    DATE(v.fecha_venta) AS fecha,
    s.nombre AS sucursal,
    COUNT(v.id_venta) AS numero_ventas,
    SUM(v.subtotal) AS subtotal,
    SUM(v.total_descuentos) AS descuentos,
    SUM(v.total_impuestos) AS impuestos,
    SUM(v.total_final) AS total,
    AVG(v.total_final) AS ticket_promedio,
    COUNT(DISTINCT v.id_cliente) AS clientes_unicos,
    COUNT(DISTINCT v.id_usuario_vendedor) AS vendedores_activos
FROM ventas v
LEFT JOIN sucursales s ON v.id_sucursal = s.id_sucursal
WHERE v.estado IN ('CERTIFICADA', 'CONTABILIZADA')
GROUP BY DATE(v.fecha_venta), s.nombre
ORDER BY fecha DESC, sucursal;

COMMENT ON VIEW vista_resumen_ventas_diarias IS 'Resumen de ventas diarias por sucursal';

-- =====================================================
-- VISTA: MOVIMIENTOS DE INVENTARIO RECIENTES
-- =====================================================

CREATE OR REPLACE VIEW vista_movimientos_inventario_recientes AS
SELECT 
    k.id_movimiento,
    k.fecha_movimiento,
    p.sku,
    p.nombre AS producto,
    s.nombre AS sucursal,
    tm.nombre AS tipo_movimiento,
    k.cantidad,
    k.stock_anterior,
    k.stock_nuevo,
    k.costo_unitario,
    k.costo_total,
    k.documento_origen,
    k.numero_documento,
    u.nombre_completo AS usuario,
    k.motivo
FROM kardex_inventario k
JOIN productos p ON k.id_producto = p.id_producto
JOIN sucursales s ON k.id_sucursal = s.id_sucursal
JOIN tipos_movimiento tm ON k.id_tipo_movimiento = tm.id_tipo_movimiento
LEFT JOIN usuarios u ON k.id_usuario = u.id_usuario
WHERE k.fecha_movimiento >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY k.fecha_movimiento DESC
LIMIT 1000;

COMMENT ON VIEW vista_movimientos_inventario_recientes IS 'Últimos 1000 movimientos de inventario (30 días)';

-- =====================================================
-- VISTA: ANÁLISIS ABC DE INVENTARIO
-- =====================================================

CREATE OR REPLACE VIEW vista_analisis_abc_inventario AS
WITH ventas_producto AS (
    SELECT 
        p.id_producto,
        p.sku,
        p.nombre,
        SUM(dv.total_linea) AS valor_ventas
    FROM productos p
    JOIN detalle_ventas dv ON p.id_producto = dv.id_producto
    JOIN ventas v ON dv.id_venta = v.id_venta
    WHERE v.estado = 'CERTIFICADA'
    AND v.fecha_venta >= CURRENT_DATE - INTERVAL '365 days'
    GROUP BY p.id_producto, p.sku, p.nombre
),
total_ventas AS (
    SELECT SUM(valor_ventas) AS total FROM ventas_producto
),
productos_acumulado AS (
    SELECT 
        vp.*,
        SUM(vp.valor_ventas) OVER (ORDER BY vp.valor_ventas DESC) AS acumulado,
        (SELECT total FROM total_ventas) AS total_general
    FROM ventas_producto vp
)
SELECT 
    id_producto,
    sku,
    nombre,
    valor_ventas,
    (valor_ventas / total_general * 100) AS porcentaje_ventas,
    (acumulado / total_general * 100) AS porcentaje_acumulado,
    CASE 
        WHEN (acumulado / total_general * 100) <= 80 THEN 'A'
        WHEN (acumulado / total_general * 100) <= 95 THEN 'B'
        ELSE 'C'
    END AS clasificacion_abc
FROM productos_acumulado
ORDER BY valor_ventas DESC;

COMMENT ON VIEW vista_analisis_abc_inventario IS 'Clasificación ABC de productos por valor de ventas';

-- =====================================================
-- VISTA: LIBRO DE VENTAS SAT
-- =====================================================

CREATE OR REPLACE VIEW vista_libro_ventas_sat AS
SELECT 
    v.fecha_venta,
    v.numero_documento,
    v.serie_sat,
    v.numero_sat,
    v.uuid_sat,
    v.tipo_dte,
    c.nit,
    c.nombre AS nombre_cliente,
    v.subtotal,
    v.total_descuentos,
    v.total_impuestos,
    v.total_final,
    v.estado,
    EXTRACT(YEAR FROM v.fecha_venta) AS anio,
    EXTRACT(MONTH FROM v.fecha_venta) AS mes
FROM ventas v
LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
WHERE v.estado IN ('CERTIFICADA', 'CONTABILIZADA')
ORDER BY v.fecha_venta, v.numero_documento;

COMMENT ON VIEW vista_libro_ventas_sat IS 'Libro de ventas según formato SAT Guatemala';

-- =====================================================
-- VISTA: LIBRO DE COMPRAS SAT
-- =====================================================

CREATE OR REPLACE VIEW vista_libro_compras_sat AS
SELECT 
    oc.fecha_orden,
    oc.numero_orden,
    p.nit,
    p.nombre AS nombre_proveedor,
    oc.subtotal,
    oc.total_impuestos,
    oc.total,
    COALESCE(ri.monto_retenido, 0) AS retencion_iva,
    oc.estado,
    EXTRACT(YEAR FROM oc.fecha_orden) AS anio,
    EXTRACT(MONTH FROM oc.fecha_orden) AS mes
FROM ordenes_compra oc
LEFT JOIN proveedores p ON oc.id_proveedor = p.id_proveedor
LEFT JOIN retenciones_iva ri ON ri.documento_origen = 'ORDEN_COMPRA' AND ri.id_documento_origen = oc.id_orden_compra
WHERE oc.estado IN ('RECIBIDA', 'COMPLETADA')
ORDER BY oc.fecha_orden, oc.numero_orden;

COMMENT ON VIEW vista_libro_compras_sat IS 'Libro de compras según formato SAT Guatemala';
