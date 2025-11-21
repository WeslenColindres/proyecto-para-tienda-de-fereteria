import { env } from './config/env';
import { createServer } from './infrastructure/http/server';

const app = createServer();

app.listen(Number(env.PORT), () => {
  console.log(`Backend escuchando en http://localhost:${env.PORT}`);
});
