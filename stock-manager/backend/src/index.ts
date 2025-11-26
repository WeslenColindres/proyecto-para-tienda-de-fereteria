import { env } from './config/env';
import { createServer } from './infrastructure/http/server';

const { httpServer } = createServer();

httpServer.listen(Number(env.PORT), () => {
  console.log(`Backend escuchando en http://localhost:${env.PORT}`);
});

