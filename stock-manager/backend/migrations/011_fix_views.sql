-- =====================================================
-- FIX: VISTAS SAT (DEPENDÍAN DE MIGRACIÓN 012)
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
