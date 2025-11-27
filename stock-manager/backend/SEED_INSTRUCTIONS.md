# Instrucciones para Cargar Datos de Prueba

## Opción 1: Usando Docker Desktop (Recomendado)

1. **Abrir Docker Desktop** y asegurarte de que el contenedor de PostgreSQL esté corriendo.

2. **Abrir la terminal integrada del contenedor**:
   - En Docker Desktop, busca el contenedor `proyectobackend-db-1`
   - Haz clic en el botón "CLI" o "Terminal"

3. **Ejecutar los siguientes comandos**:
   ```bash
   # Conectar a la base de datos
   psql -U postgres -d stock_manager
   
   # Copiar y pegar el contenido completo de seed.sql
   # O ejecutar desde archivo si lo has copiado al contenedor
   ```

## Opción 2: Usando pgAdmin o DBeaver

1. **Conectar a la base de datos**:
   - Host: `localhost`
   - Puerto: `5432`
   - Usuario: `postgres`
   - Contraseña: `postgres`
   - Base de datos: `stock_manager`

2. **Abrir el archivo** `backend/src/scripts/seed.sql`

3. **Ejecutar el script completo** (Ctrl+Enter o botón "Execute")

## Opción 3: Desde la línea de comandos

```powershell
# Asegúrate de que el contenedor esté corriendo
docker ps

# Copia el archivo al contenedor
docker cp "c:\Users\Colindres\Documents\proyecto para tienda de fereteria\stock-manager\backend\src\scripts\seed.sql" proyectobackend-db-1:/tmp/seed.sql

# Ejecuta el script
docker exec -i proyectobackend-db-1 psql -U postgres -d stock_manager -f /tmp/seed.sql
```

## Datos Creados

El script creará:
- ✅ **1 Empresa**: Ferretería La Central
- ✅ **2 Sucursales**: Central y Norte
- ✅ **2 Usuarios**: admin / vendedor (password: admin123 / vendedor123)
- ✅ **5 Proveedores**: Disfer, Cempro, Stanley, Sherwin, Aceros GT
- ✅ **5 Categorías**: Herramientas, Materiales, Plomería, Eléctrico, Pintura
- ✅ **9 Productos**: Con SKU, códigos de barras y precios
- ✅ **Stock**: Inventario inicial en ambas sucursales
- ✅ **4 Clientes**: Incluyendo Consumidor Final
- ✅ **5 Notificaciones**: De prueba para el sistema

## Verificar que los datos se cargaron

```sql
-- Contar registros
SELECT 'Productos' as tabla, COUNT(*) as total FROM productos
UNION ALL
SELECT 'Proveedores', COUNT(*) FROM proveedores
UNION ALL
SELECT 'Clientes', COUNT(*) FROM clientes
UNION ALL
SELECT 'Stock', COUNT(*) FROM stock_producto;
```

Deberías ver:
- Productos: 9
- Proveedores: 5
- Clientes: 4
- Stock: 10
