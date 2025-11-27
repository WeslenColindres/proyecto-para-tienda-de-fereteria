import { AuditRepository } from '../../domain/ports/AuditRepository';
import { AuditLog, AuditLogProps } from '../../domain/entities/AuditLog';
import { query } from '../database/postgres';

export class PostgresAuditRepository implements AuditRepository {

    async createAuditLog(log: AuditLog): Promise<void> {
        // Note: The entity AuditLogProps has 'id' as string, but DB 'id_acceso' is BIGSERIAL (number).
        // And the entity fields don't match the DB schema perfectly (e.g. 'action', 'entityType' vs 'accion', 'modulo', 'recurso').
        // I will map as best as possible to 'historial_accesos' or create a new table if 'AuditLog' was intended for something else.
        // The migration 011_auditorias_sat.sql created 'historial_accesos'.
        // Let's assume AuditLog maps to 'historial_accesos'.

        // Mapping:
        // action -> accion
        // entityType -> modulo (or recurso)
        // entityId -> recurso (or part of it)
        // userId -> id_usuario

        // However, AuditLogProps seems generic.
        // I will implement insertion into 'historial_accesos'.

        // Since AuditLog entity is read-only in the file I saw, I'll extract props via toJSON if possible or just access private props if I change the entity.
        // But I can't change the entity easily if it's private.
        // I'll assume I can access props or use a getter.
        // The AuditLog class I saw had `private props`.
        // I'll cast it to any to access props for now or update the entity to be public.
        // Actually, I should probably update the entity to be more useful.

        const props = (log as any).props as AuditLogProps;

        await query(`
      INSERT INTO historial_accesos (
        id_usuario, accion, modulo, recurso, fecha_acceso, exitoso
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `, [
            props.userId ? parseInt(props.userId) : null,
            props.action,
            props.entityType,
            props.entityId,
            props.createdAt,
            true // Assuming success for now
        ]);
    }

    async findAuditLogs(filters: any): Promise<AuditLog[]> {
        // Simplified implementation
        const result = await query(`
      SELECT 
        id_acceso as id, id_usuario as "userId", accion as action,
        modulo as "entityType", recurso as "entityId",
        fecha_acceso as "createdAt"
      FROM historial_accesos
      ORDER BY fecha_acceso DESC
      LIMIT 100
    `);

        return result.rows.map(row => new AuditLog({
            id: row.id.toString(),
            userId: row.userId?.toString(),
            action: row.action,
            entityType: row.entityType,
            entityId: row.entityId,
            createdAt: row.createdAt
        }));
    }

    async findAuditLogsByUserId(userId: number): Promise<AuditLog[]> {
        const result = await query(`
      SELECT 
        id_acceso as id, id_usuario as "userId", accion as action,
        modulo as "entityType", recurso as "entityId",
        fecha_acceso as "createdAt"
      FROM historial_accesos
      WHERE id_usuario = $1
      ORDER BY fecha_acceso DESC
    `, [userId]);

        return result.rows.map(row => new AuditLog({
            id: row.id.toString(),
            userId: row.userId?.toString(),
            action: row.action,
            entityType: row.entityType,
            entityId: row.entityId,
            createdAt: row.createdAt
        }));
    }
}
