import { ClientRepository } from '../../domain/ports/client.repository';
import { Client } from '../../domain/entities/client.entity';
import { query } from '../database/postgres';

export class PostgresClientRepository implements ClientRepository {
    async findById(id: number): Promise<Client | null> {
        const result = await query(
            `SELECT 
        id_cliente as id, nit, nombre as name, nombre_comercial as "tradeName",
        id_tipo_cliente as "clientTypeId", email, telefono as phone,
        fecha_nacimiento as "birthDate", limite_credito as "creditLimit",
        dias_credito as "creditDays", activo as "isActive",
        fecha_registro as "registeredAt", fecha_ultima_compra as "lastPurchaseAt"
       FROM clientes WHERE id_cliente = $1`,
            [id]
        );
        if (result.rows.length === 0) return null;
        return new Client(result.rows[0]);
    }

    async findByNit(nit: string): Promise<Client | null> {
        const result = await query(
            `SELECT 
        id_cliente as id, nit, nombre as name, nombre_comercial as "tradeName",
        id_tipo_cliente as "clientTypeId", email, telefono as phone,
        fecha_nacimiento as "birthDate", limite_credito as "creditLimit",
        dias_credito as "creditDays", activo as "isActive",
        fecha_registro as "registeredAt", fecha_ultima_compra as "lastPurchaseAt"
       FROM clientes WHERE nit = $1`,
            [nit]
        );
        if (result.rows.length === 0) return null;
        return new Client(result.rows[0]);
    }

    async findAll(limit: number = 20, offset: number = 0): Promise<Client[]> {
        const result = await query(
            `SELECT 
        id_cliente as id, nit, nombre as name, nombre_comercial as "tradeName",
        id_tipo_cliente as "clientTypeId", email, telefono as phone,
        fecha_nacimiento as "birthDate", limite_credito as "creditLimit",
        dias_credito as "creditDays", activo as "isActive",
        fecha_registro as "registeredAt", fecha_ultima_compra as "lastPurchaseAt"
       FROM clientes LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
        return result.rows.map((row) => new Client(row));
    }

    async searchByName(searchTerm: string, limit: number = 10): Promise<Client[]> {
        const result = await query(
            `SELECT 
        id_cliente as id, nit, nombre as name, nombre_comercial as "tradeName",
        id_tipo_cliente as "clientTypeId", email, telefono as phone,
        fecha_nacimiento as "birthDate", limite_credito as "creditLimit",
        dias_credito as "creditDays", activo as "isActive",
        fecha_registro as "registeredAt", fecha_ultima_compra as "lastPurchaseAt"
       FROM clientes 
       WHERE (nombre ILIKE $1 OR nit ILIKE $1 OR nombre_comercial ILIKE $1)
       AND activo = true
       ORDER BY nombre
       LIMIT $2`,
            [`%${searchTerm}%`, limit]
        );
        return result.rows.map((row) => new Client(row));
    }

    async save(client: Client): Promise<Client> {
        const result = await query(
            `INSERT INTO clientes (
        nit, nombre, nombre_comercial, id_tipo_cliente, email, telefono,
        fecha_nacimiento, limite_credito, dias_credito, activo
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id_cliente as id`,
            [
                client.nit,
                client.name,
                client.props.tradeName,
                client.props.clientTypeId,
                client.props.email,
                client.props.phone,
                client.props.birthDate,
                client.props.creditLimit,
                client.props.creditDays,
                client.props.isActive,
            ]
        );
        return new Client({ ...client.props, id: result.rows[0].id });
    }

    async update(client: Client): Promise<Client> {
        await query(
            `UPDATE clientes SET 
        nit = $1, nombre = $2, nombre_comercial = $3, id_tipo_cliente = $4,
        email = $5, telefono = $6, fecha_nacimiento = $7, limite_credito = $8,
        dias_credito = $9, activo = $10, fecha_ultima_compra = $11
       WHERE id_cliente = $12`,
            [
                client.nit,
                client.name,
                client.props.tradeName,
                client.props.clientTypeId,
                client.props.email,
                client.props.phone,
                client.props.birthDate,
                client.props.creditLimit,
                client.props.creditDays,
                client.props.isActive,
                client.props.lastPurchaseAt,
                client.id,
            ]
        );
        return client;
    }

    async delete(id: number): Promise<void> {
        await query('DELETE FROM clientes WHERE id_cliente = $1', [id]);
    }
}
