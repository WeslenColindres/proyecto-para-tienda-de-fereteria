import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'stock_manager',
  user: process.env.DB_USER || 'stock_user',
  password: process.env.DB_PASSWORD || 'stock_pass',
});

async function queryDatabaseState() {
  try {
    console.log('🔍 CONSULTANDO ESTADO ACTUAL DE LA BASE DE DATOS\n');
    console.log('='.repeat(80));

    // 1. Listar todas las tablas
    const tablesResult = await pool.query(`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);

    console.log('\n📊 TABLAS EN LA BASE DE DATOS:');
    console.log('-'.repeat(80));
    console.log(`Total de tablas: ${tablesResult.rows.length}\n`);
    tablesResult.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.tablename} (${row.size})`);
    });

    // 2. Contar registros en cada tabla
    console.log('\n\n📈 CANTIDAD DE REGISTROS POR TABLA:');
    console.log('-'.repeat(80));

    for (const table of tablesResult.rows) {
      try {
        const countResult = await pool.query(`SELECT COUNT(*) FROM ${table.tablename}`);
        const count = parseInt(countResult.rows[0].count);
        if (count > 0) {
          console.log(`✓ ${table.tablename}: ${count} registro(s)`);
        } else {
          console.log(`  ${table.tablename}: 0 registros (vacía)`);
        }
      } catch (error: any) {
        console.log(`✗ ${table.tablename}: Error al contar - ${error.message}`);
      }
    }

    // 3. Datos específicos de tablas importantes
    console.log('\n\n🏢 DATOS DE EMPRESA Y SUCURSALES:');
    console.log('-'.repeat(80));
    const empresaResult = await pool.query('SELECT * FROM empresa');
    if (empresaResult.rows.length > 0) {
      empresaResult.rows.forEach(emp => {
        console.log(`Empresa: ${emp.nombre_comercial} (NIT: ${emp.nit})`);
      });
    } else {
      console.log('No hay empresas registradas');
    }

    const sucursalesResult = await pool.query('SELECT * FROM sucursales');
    if (sucursalesResult.rows.length > 0) {
      console.log('\nSucursales:');
      sucursalesResult.rows.forEach(suc => {
        console.log(`  - ${suc.nombre} (${suc.codigo_sucursal}) - ${suc.es_matriz ? 'MATRIZ' : 'SUCURSAL'}`);
      });
    } else {
      console.log('No hay sucursales registradas');
    }

    // 4. Usuarios y Roles
    console.log('\n\n👥 USUARIOS Y ROLES:');
    console.log('-'.repeat(80));
    const rolesResult = await pool.query('SELECT * FROM roles');
    console.log(`Roles definidos: ${rolesResult.rows.length}`);
    rolesResult.rows.forEach(rol => {
      console.log(`  - ${rol.nombre}: ${rol.descripcion}`);
    });

    const usuariosResult = await pool.query(`
      SELECT u.username, u.nombre_completo, u.email, r.nombre as rol, u.activo
      FROM usuarios u
      LEFT JOIN roles r ON u.id_rol = r.id_rol
    `);
    console.log(`\nUsuarios registrados: ${usuariosResult.rows.length}`);
    usuariosResult.rows.forEach(user => {
      console.log(`  - ${user.username} (${user.nombre_completo}) - Rol: ${user.rol} - ${user.activo ? 'ACTIVO' : 'INACTIVO'}`);
    });

    // 5. Productos
    console.log('\n\n📦 PRODUCTOS:');
    console.log('-'.repeat(80));
    const productosResult = await pool.query(`
      SELECT 
        p.sku,
        p.nombre,
        c.nombre as categoria,
        u.nombre as unidad,
        p.activo
      FROM productos p
      LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
      LEFT JOIN unidades_medida u ON p.id_unidad_medida = u.id_unidad
      ORDER BY p.sku
      LIMIT 10
    `);
    console.log(`Total de productos: ${productosResult.rows.length}`);
    if (productosResult.rows.length > 0) {
      console.log('\nPrimeros 10 productos:');
      productosResult.rows.forEach(prod => {
        console.log(`  - ${prod.sku}: ${prod.nombre} (${prod.categoria}) - ${prod.activo ? 'ACTIVO' : 'INACTIVO'}`);
      });
    }

    // 6. Stock
    console.log('\n\n📊 STOCK DISPONIBLE:');
    console.log('-'.repeat(80));
    const stockResult = await pool.query(`
      SELECT 
        p.sku,
        p.nombre,
        s.nombre as sucursal,
        sp.cantidad_disponible,
        sp.cantidad_reservada
      FROM stock_producto sp
      JOIN productos p ON sp.id_producto = p.id_producto
      JOIN sucursales s ON sp.id_sucursal = s.id_sucursal
      WHERE sp.cantidad_disponible > 0
      ORDER BY sp.cantidad_disponible DESC
      LIMIT 10
    `);
    console.log(`Productos con stock: ${stockResult.rows.length}`);
    if (stockResult.rows.length > 0) {
      console.log('\nTop 10 productos con más stock:');
      stockResult.rows.forEach(stock => {
        console.log(`  - ${stock.sku}: ${stock.nombre} en ${stock.sucursal}`);
        console.log(`    Disponible: ${stock.cantidad_disponible}, Reservado: ${stock.cantidad_reservada}`);
      });
    }

    // 7. Proveedores
    console.log('\n\n🏭 PROVEEDORES:');
    console.log('-'.repeat(80));
    const proveedoresResult = await pool.query('SELECT * FROM proveedores ORDER BY nombre');
    console.log(`Total de proveedores: ${proveedoresResult.rows.length}`);
    if (proveedoresResult.rows.length > 0) {
      proveedoresResult.rows.forEach(prov => {
        console.log(`  - ${prov.nombre} (NIT: ${prov.nit}) - ${prov.activo ? 'ACTIVO' : 'INACTIVO'}`);
      });
    }

    // 8. Clientes
    console.log('\n\n👤 CLIENTES:');
    console.log('-'.repeat(80));
    const clientesResult = await pool.query(`
      SELECT c.nit, c.nombre, tc.nombre as tipo, c.activo
      FROM clientes c
      LEFT JOIN tipos_cliente tc ON c.id_tipo_cliente = tc.id_tipo_cliente
      ORDER BY c.nombre
    `);
    console.log(`Total de clientes: ${clientesResult.rows.length}`);
    if (clientesResult.rows.length > 0) {
      clientesResult.rows.forEach(cliente => {
        console.log(`  - ${cliente.nombre} (NIT: ${cliente.nit}) - Tipo: ${cliente.tipo} - ${cliente.activo ? 'ACTIVO' : 'INACTIVO'}`);
      });
    }

    // 9. Notificaciones
    console.log('\n\n🔔 NOTIFICACIONES:');
    console.log('-'.repeat(80));
    const notificationsResult = await pool.query(`
      SELECT title, type, priority, is_read, created_at
      FROM notifications
      ORDER BY created_at DESC
      LIMIT 10
    `);
    console.log(`Total de notificaciones: ${notificationsResult.rows.length}`);
    if (notificationsResult.rows.length > 0) {
      console.log('\nÚltimas 10 notificaciones:');
      notificationsResult.rows.forEach(notif => {
        const status = notif.is_read ? '✓ Leída' : '✗ No leída';
        console.log(`  ${status} [${notif.priority}] ${notif.title} (${notif.type})`);
      });
    }

    // 10. Índices
    console.log('\n\n🔍 ÍNDICES CREADOS:');
    console.log('-'.repeat(80));
    const indexesResult = await pool.query(`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `);
    console.log(`Total de índices: ${indexesResult.rows.length}\n`);
    
    // Agrupar por tabla
    const indexesByTable: Record<string, any[]> = {};
    indexesResult.rows.forEach(idx => {
      if (!indexesByTable[idx.tablename]) {
        indexesByTable[idx.tablename] = [];
      }
      indexesByTable[idx.tablename].push(idx);
    });

    Object.keys(indexesByTable).sort().forEach(tableName => {
      console.log(`\n${tableName}:`);
      indexesByTable[tableName].forEach(idx => {
        console.log(`  - ${idx.indexname}`);
      });
    });

    // 11. Vistas
    console.log('\n\n👁️ VISTAS CREADAS:');
    console.log('-'.repeat(80));
    const viewsResult = await pool.query(`
      SELECT 
        schemaname,
        viewname,
        definition
      FROM pg_views
      WHERE schemaname = 'public'
      ORDER BY viewname
    `);
    console.log(`Total de vistas: ${viewsResult.rows.length}\n`);
    viewsResult.rows.forEach(view => {
      console.log(`  - ${view.viewname}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('✅ Consulta completada exitosamente');

  } catch (error) {
    console.error('❌ Error al consultar la base de datos:', error);
  } finally {
    await pool.end();
  }
}

queryDatabaseState();
