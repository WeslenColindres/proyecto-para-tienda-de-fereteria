import { Pool } from 'pg';
import { SystemConfigRepository } from '../../domain/ports/system-config.repository';
import { SystemConfig } from '../../domain/entities/system-config.entity';
import { db } from '../database/postgres';

export class PostgresSystemConfigRepository implements SystemConfigRepository {
    private pool: Pool;

    constructor() {
        this.pool = db;
    }

    async findByKey(key: string): Promise<SystemConfig | null> {
        const query = 'SELECT * FROM system_configs WHERE key = $1';
        const result = await this.pool.query(query, [key]);

        if (result.rows.length === 0) return null;

        const row = result.rows[0];
        return new SystemConfig({
            id: row.id,
            key: row.key,
            value: row.value,
            description: row.description,
            updatedAt: row.updated_at,
        });
    }

    async save(config: SystemConfig): Promise<SystemConfig> {
        const query = `
            INSERT INTO system_configs (key, value, description, updated_at)
            VALUES ($1, $2, $3, NOW())
            ON CONFLICT (key) DO UPDATE
            SET value = $2, description = $3, updated_at = NOW()
            RETURNING *
        `;
        const values = [config.key, config.value, config.description];
        const result = await this.pool.query(query, values);
        const row = result.rows[0];

        return new SystemConfig({
            id: row.id,
            key: row.key,
            value: row.value,
            description: row.description,
            updatedAt: row.updated_at,
        });
    }

    async findAll(): Promise<SystemConfig[]> {
        const query = 'SELECT * FROM system_configs ORDER BY key ASC';
        const result = await this.pool.query(query);

        return result.rows.map(row => new SystemConfig({
            id: row.id,
            key: row.key,
            value: row.value,
            description: row.description,
            updatedAt: row.updated_at,
        }));
    }
}
