import { query } from '../infrastructure/database/postgres';

async function setupPOSPrerequisites() {
    console.log('🔍 Verificando prerequisitos para POS...\n');

    try {
        // 1. Verificar sucursales
        console.log('1️⃣ Verificando sucursales...');
        const sucursalesResult = await query('SELECT id_sucursal, codigo_sucursal, nombre, activa FROM sucursales');

        if (sucursalesResult.rows.length === 0) {
            console.log('   ⚠️  No hay sucursales. Creando sucursal principal...');
            await query(`
                INSERT INTO sucursales (codigo_sucursal, nombre, direccion, activa, es_matriz)
                VALUES ('SUC001', 'Sucursal Principal', 'Dirección Principal', true, true)
                RETURNING id_sucursal, nombre
            `);
            console.log('   ✅ Sucursal principal creada');
        } else {
            console.log(`   ✅ ${sucursalesResult.rows.length} sucursal(es) encontrada(s):`);
            sucursalesResult.rows.forEach(s => {
                console.log(`      - ${s.codigo_sucursal}: ${s.nombre} (${s.activa ? 'Activa' : 'Inactiva'})`);
            });
        }

        // 2. Verificar series de documentos
        console.log('\n2️⃣ Verificando series de documentos...');
        const seriesResult = await query(`
            SELECT id_serie, id_sucursal, tipo_documento, serie, correlativo_actual, activa 
            FROM series_documentos 
            WHERE activa = true
        `);

        if (seriesResult.rows.length === 0) {
            console.log('   ⚠️  No hay series activas. Creando series...');

            // Obtener primera sucursal
            const firstBranch = await query('SELECT id_sucursal FROM sucursales LIMIT 1');
            const branchId = firstBranch.rows[0].id_sucursal;

            // Crear serie para FACTURA
            await query(`
                INSERT INTO series_documentos (id_sucursal, tipo_documento, serie, correlativo_actual, correlativo_inicio, correlativo_fin, activa)
                VALUES ($1, 'FACTURA', 'A', 0, 1, 999999, true)
            `, [branchId]);

            // Crear serie para COMPROBANTE
            await query(`
                INSERT INTO series_documentos (id_sucursal, tipo_documento, serie, correlativo_actual, correlativo_inicio, correlativo_fin, activa)
                VALUES ($1, 'COMPROBANTE', 'C', 0, 1, 999999, true)
            `, [branchId]);

            console.log('   ✅ Series de documentos creadas (FACTURA y COMPROBANTE)');
        } else {
            console.log(`   ✅ ${seriesResult.rows.length} serie(s) activa(s):`);
            seriesResult.rows.forEach(s => {
                console.log(`      - Sucursal ${s.id_sucursal}: ${s.tipo_documento} Serie ${s.serie} (Correlativo: ${s.correlativo_actual})`);
            });
        }

        // 3. Verificar productos
        console.log('\n3️⃣ Verificando productos...');
        const productsResult = await query('SELECT COUNT(*) as total FROM productos WHERE activo = true');
        const totalProducts = parseInt(productsResult.rows[0].total);
        console.log(`   ℹ️  Total de productos activos: ${totalProducts}`);

        // 4. Verificar stock
        console.log('\n4️⃣ Verificando stock de productos...');
        const stockResult = await query(`
            SELECT 
                p.id_producto, 
                p.nombre, 
                sp.cantidad_disponible,
                sp.id_sucursal
            FROM productos p
            LEFT JOIN stock_producto sp ON p.id_producto = sp.id_producto
            WHERE p.activo = true
            LIMIT 10
        `);

        const productsWithStock = stockResult.rows.filter(p => p.cantidad_disponible && p.cantidad_disponible > 0);
        const productsWithoutStock = stockResult.rows.filter(p => !p.cantidad_disponible || p.cantidad_disponible === 0);

        console.log(`   ✅ Productos con stock: ${productsWithStock.length}`);
        if (productsWithStock.length > 0) {
            console.log('   Ejemplos:');
            productsWithStock.slice(0, 5).forEach(p => {
                console.log(`      - ${p.nombre}: ${p.cantidad_disponible} unidades`);
            });
        }

        if (productsWithoutStock.length > 0) {
            console.log(`   ⚠️  Productos sin stock: ${productsWithoutStock.length}`);
        }

        // 5. Verificar tipos de movimiento
        console.log('\n5️⃣ Verificando tipos de movimiento...');
        const movementTypesResult = await query(`
            SELECT codigo, nombre FROM tipos_movimiento WHERE codigo = 'VENTA'
        `);

        if (movementTypesResult.rows.length > 0) {
            console.log('   ✅ Tipo de movimiento VENTA configurado');
        } else {
            console.log('   ⚠️  Tipo de movimiento VENTA no encontrado');
        }

        // 6. Resumen final
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMEN DE PREREQUISITOS');
        console.log('='.repeat(60));
        console.log(`✅ Sucursales: ${sucursalesResult.rows.length > 0 ? 'OK' : 'FALTA CONFIGURAR'}`);
        console.log(`✅ Series de documentos: ${seriesResult.rows.length > 0 ? 'OK' : 'FALTA CONFIGURAR'}`);
        console.log(`✅ Productos: ${totalProducts} activos`);
        console.log(`✅ Productos con stock: ${productsWithStock.length}`);
        console.log('='.repeat(60));

        if (sucursalesResult.rows.length > 0 && seriesResult.rows.length > 0 && productsWithStock.length > 0) {
            console.log('\n🎉 El sistema está listo para realizar ventas!');
        } else {
            console.log('\n⚠️  Faltan configuraciones. Revisa los puntos marcados arriba.');
        }

    } catch (error) {
        console.error('❌ Error al verificar prerequisitos:', error);
        throw error;
    }
}

// Ejecutar
setupPOSPrerequisites()
    .then(() => {
        console.log('\n✅ Verificación completada');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Error:', error);
        process.exit(1);
    });
