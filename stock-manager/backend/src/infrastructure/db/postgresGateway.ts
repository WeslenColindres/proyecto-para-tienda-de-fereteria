import { Pool, type PoolClient, type QueryResult } from 'pg';
import { env } from '../../config/env';

export class PostgresGateway {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: env.DB.HOST,
      port: env.DB.PORT,
      database: env.DB.NAME,
      user: env.DB.USER,
      password: env.DB.PASSWORD,
      ssl: env.DB.SSL ? { rejectUnauthorized: false } : undefined,
      max: env.DB.POOL_MAX,
      min: env.DB.POOL_MIN,
      idleTimeoutMillis: 30_000,
    });
  }

  async query<T = unknown>(sql: string, params?: any[]): Promise<T[]> {
    const client = await this.pool.connect();
    try {
      const result: QueryResult<T> = await client.query(sql, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
