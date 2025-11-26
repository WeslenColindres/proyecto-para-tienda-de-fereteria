import { UserRepository } from '../../domain/ports/user.repository';
import { User } from '../../domain/entities/user.entity';
import { query } from '../database/postgres';

export class PostgresUserRepository implements UserRepository {
    async findById(id: number): Promise<User | null> {
        const result = await query(
            `SELECT 
        id_usuario as id, username, password_hash as "passwordHash", email, 
        nombre_completo as "fullName", id_rol as "roleId", activo as "isActive",
        ultimo_acceso as "lastAccess", intentos_fallidos as "failedAttempts",
        bloqueado_hasta as "lockedUntil", fecha_creacion as "createdAt"
       FROM usuarios WHERE id_usuario = $1`,
            [id]
        );
        if (result.rows.length === 0) return null;
        return new User(result.rows[0]);
    }

    async findByUsername(username: string): Promise<User | null> {
        const result = await query(
            `SELECT 
        id_usuario as id, username, password_hash as "passwordHash", email, 
        nombre_completo as "fullName", id_rol as "roleId", activo as "isActive",
        ultimo_acceso as "lastAccess", intentos_fallidos as "failedAttempts",
        bloqueado_hasta as "lockedUntil", fecha_creacion as "createdAt"
       FROM usuarios WHERE username = $1`,
            [username]
        );
        if (result.rows.length === 0) return null;
        return new User(result.rows[0]);
    }

    async findByEmail(email: string): Promise<User | null> {
        const result = await query(
            `SELECT 
        id_usuario as id, username, password_hash as "passwordHash", email, 
        nombre_completo as "fullName", id_rol as "roleId", activo as "isActive",
        ultimo_acceso as "lastAccess", intentos_fallidos as "failedAttempts",
        bloqueado_hasta as "lockedUntil", fecha_creacion as "createdAt"
       FROM usuarios WHERE email = $1`,
            [email]
        );
        if (result.rows.length === 0) return null;
        return new User(result.rows[0]);
    }

    async save(user: User): Promise<User> {
        const result = await query(
            `INSERT INTO usuarios (
        username, password_hash, email, nombre_completo, id_rol, activo
       ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_usuario as id`,
            [
                user.username,
                user.passwordHash,
                user.email,
                user.fullName,
                user.roleId,
                user.isActive,
            ]
        );
        const savedUser = new User({ ...user.props, id: result.rows[0].id });
        return savedUser;
    }

    async update(user: User): Promise<User> {
        await query(
            `UPDATE usuarios SET 
        username = $1, password_hash = $2, email = $3, nombre_completo = $4,
        id_rol = $5, activo = $6, ultimo_acceso = $7, intentos_fallidos = $8,
        bloqueado_hasta = $9
       WHERE id_usuario = $10`,
            [
                user.username,
                user.passwordHash,
                user.email,
                user.fullName,
                user.roleId,
                user.isActive,
                user.props.lastAccess,
                user.props.failedAttempts,
                user.props.lockedUntil,
                user.id,
            ]
        );
        return user;
    }

    async delete(id: number): Promise<void> {
        await query('DELETE FROM usuarios WHERE id_usuario = $1', [id]);
    }
}
