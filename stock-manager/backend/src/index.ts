import { env } from './config/env';
import { createServer } from './infrastructure/http/server';

import { testConnection } from './infrastructure/database/postgres';

const { httpServer } = createServer();

httpServer.listen(Number(env.PORT), async () => {
  console.log(`Backend escuchando en http://localhost:${env.PORT}`);

  // Verificar conexión a base de datos
  const isConnected = await testConnection();
  if (isConnected) {
    console.log('✅ Conexión a Base de Datos: EXITOSA');
  } else {
    console.error('❌ Conexión a Base de Datos: FALLIDA');
  }
});

