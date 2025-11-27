import { query } from '../infrastructure/database/postgres';

/**
 * Script to set up initial data for the POS system
 * Run this once to configure the system
 */
async function setupInitialData() {
    try {
        console.log('🚀 Setting up initial data...\n');

        // 1. Create default branch
        console.log('📍 Creating default branch...');
        const branchResult = await query(
            `INSERT INTO sucursales (
        id_empresa, codigo_sucursal, nombre, direccion, departamento,
        municipio, es_matriz, activa, fecha_apertura
       ) VALUES (
        1, 'SUC001', 'Sucursal Principal', 'Ciudad de Guatemala',
        'Guatemala', 'Guatemala', true, true, CURRENT_DATE
       )
       ON CONFLICT (codigo_sucursal) DO NOTHING
       RETURNING id_sucursal`,
            []
        );
        const branchId = branchResult.rows.length > 0 ? branchResult.rows[0].id_sucursal : 1;
        console.log(`✅ Branch created/exists with ID: ${branchId}\n`);

        // 2. Create document series
        console.log('📄 Creating document series...');

        // Series for FACTURA
        await query(
            `INSERT INTO series_documentos (
        id_sucursal, tipo_documento, serie, correlativo_actual,
        correlativo_inicio, correlativo_fin, fecha_autorizacion,
        fecha_vencimiento, activa
       ) VALUES (
        $1, 'FACTURA', 'A', 0, 1, 999999,
        CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', true
       )
       ON CONFLICT (id_sucursal, tipo_documento, serie) DO NOTHING`,
            [branchId]
        );
        console.log('✅ FACTURA series created (Serie A)');

        // Series for COMPROBANTE
        await query(
            `INSERT INTO series_documentos (
        id_sucursal, tipo_documento, serie, correlativo_actual,
        correlativo_inicio, correlativo_fin, fecha_autorizacion,
        fecha_vencimiento, activa
       ) VALUES (
        $1, 'COMPROBANTE', 'C', 0, 1, 999999,
        CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', true
       )
       ON CONFLICT (id_sucursal, tipo_documento, serie) DO NOTHING`,
            [branchId]
        );
        console.log('✅ COMPROBANTE series created (Serie C)\n');

        // 3. Ensure default client type exists
        console.log('👥 Creating default client type...');
        await query(
            `INSERT INTO tipos_cliente (nombre, descuento_predeterminado, descripcion)
       VALUES ('General', 0.00, 'Cliente general sin descuento especial')
       ON CONFLICT (nombre) DO NOTHING`,
            []
        );
        console.log('✅ Default client type created\n');

        // 4. Ensure payment methods exist
        console.log('💳 Verifying payment methods...');
        const paymentMethods = [
            { codigo: 'EFECTIVO', nombre: 'Efectivo', dias: 0 },
            { codigo: 'TARJETA', nombre: 'Tarjeta Crédito/Débito', dias: 1 },
            { codigo: 'TRANSFERENCIA', nombre: 'Transferencia Bancaria', dias: 1 },
        ];

        for (const pm of paymentMethods) {
            await query(
                `INSERT INTO formas_pago (codigo, nombre, dias_acreditacion, activa)
         VALUES ($1, $2, $3, true)
         ON CONFLICT (codigo) DO NOTHING`,
                [pm.codigo, pm.nombre, pm.dias]
            );
        }
        console.log('✅ Payment methods verified\n');

        // 5. Ensure movement types exist
        console.log('📦 Verifying movement types...');
        const movementTypes = [
            { codigo: 'VENTA', nombre: 'Venta de Producto', afecta: 'SALIDA', modulo: 'VENTAS' },
            { codigo: 'COMPRA', nombre: 'Compra a Proveedor', afecta: 'ENTRADA', modulo: 'COMPRAS' },
        ];

        for (const mt of movementTypes) {
            await query(
                `INSERT INTO tipos_movimiento (codigo, nombre, afecta_stock, modulo_origen, activo)
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT (codigo) DO NOTHING`,
                [mt.codigo, mt.nombre, mt.afecta, mt.modulo]
            );
        }
        console.log('✅ Movement types verified\n');

        // 6. Create default company if not exists
        console.log('🏢 Creating default company...');
        await query(
            `INSERT INTO empresa (
        nombre_comercial, razon_social, nit, telefono, email, activa
       ) VALUES (
        'Mi Ferretería', 'Mi Ferretería S.A.', '12345678-9',
        '2222-2222', 'info@miferreteria.com', true
       )
       ON CONFLICT (nit) DO NOTHING`,
            []
        );
        console.log('✅ Default company created\n');

        console.log('✨ Initial data setup completed successfully!\n');
        console.log('📊 Summary:');
        console.log(`   - Branch ID: ${branchId}`);
        console.log('   - Document Series: FACTURA (A), COMPROBANTE (C)');
        console.log('   - Payment Methods: EFECTIVO, TARJETA, TRANSFERENCIA');
        console.log('   - Movement Types: VENTA, COMPRA');
        console.log('\n🎉 System is ready for POS operations!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error setting up initial data:', error);
        process.exit(1);
    }
}

// Run the setup
setupInitialData();
