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

    async findAll(params: any = {}): Promise<{ clients: Client[], total: number }> {
        const limit = params.limit || 20;
        const offset = params.offset || 0;

        const whereClauses: string[] = [];
        const queryParams: any[] = [];
        let paramIndex = 1;

        // Default filter: active clients only, unless specified otherwise
        if (params.status && params.status !== 'all') {
            if (params.status === 'activo') {
                whereClauses.push(`activo = true`);
            } else if (params.status === 'inactivo') {
                whereClauses.push(`activo = false`);
            }
        }

        if (params.city && params.city !== 'all') {
            // Assuming address is stored in a related table or jsonb, but for now let's skip if column doesn't exist
            // Or if city is in the client table? It's not in the select list.
            // Let's ignore city for now or check if it's in props.
        }

        if (params.type && params.type !== 'all') {
            // Map frontend types to DB ids if necessary, or assume params.type is the ID
            // For now, let's assume params.type is the ID if numeric, or ignore
        }

        if (params.search) {
            whereClauses.push(`(nombre ILIKE $${paramIndex} OR nit ILIKE $${paramIndex} OR nombre_comercial ILIKE $${paramIndex})`);
            queryParams.push(`%${params.search}%`);
            paramIndex++;
        }

        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        // Count
        const countRes = await query(`SELECT COUNT(*) as total FROM clientes ${whereSql}`, queryParams);
        const total = Number(countRes.rows[0].total);

        const result = await query(
            `SELECT 
        id_cliente as id, nit, nombre as name, nombre_comercial as "tradeName",
        id_tipo_cliente as "clientTypeId", email, telefono as phone,
        fecha_nacimiento as "birthDate", limite_credito as "creditLimit",
        dias_credito as "creditDays", activo as "isActive",
        fecha_registro as "registeredAt", fecha_ultima_compra as "lastPurchaseAt"
       FROM clientes 
       ${whereSql}
       ORDER BY nombre ASC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
            [...queryParams, limit, offset]
        );
        return { clients: result.rows.map((row) => new Client(row)), total };
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
        // Soft delete
        await query('UPDATE clientes SET activo = false WHERE id_cliente = $1', [id]);
    }

    async getAccountsReceivable(clientId: number): Promise<{ limit: number, used: number, available: number }> {
        // Get client credit limit
        const clientRes = await query('SELECT limite_credito FROM clientes WHERE id_cliente = $1', [clientId]);
        if (clientRes.rows.length === 0) return { limit: 0, used: 0, available: 0 };

        const limit = Number(clientRes.rows[0].limite_credito) || 0;

        // Calculate used credit (sum of unpaid sales with due date)
        // Assuming 'estado' != 'pagado' and 'fecha_vencimiento' IS NOT NULL
        const usedRes = await query(
            `SELECT SUM(total_final) as used 
             FROM ventas 
             WHERE id_cliente = $1 
             AND fecha_vencimiento IS NOT NULL 
             AND estado NOT IN ('pagado', 'anulado')`,
            [clientId]
        );

        const used = Number(usedRes.rows[0].used) || 0;
        const available = limit - used;

        return { limit, used, available };
    }
}
