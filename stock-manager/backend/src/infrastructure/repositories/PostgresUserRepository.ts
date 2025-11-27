import { UserRepository } from '../../domain/ports/UserRepository';
import { User, UserProps } from '../../domain/entities/User';
import { Role, RoleProps } from '../../domain/entities/Role';
import { Permission, PermissionProps } from '../../domain/entities/Permission';
import { query } from '../database/postgres';

export class PostgresUserRepository implements UserRepository {

    async findAllUsers(): Promise<User[]> {
        const result = await query(`
      SELECT 
        id_usuario as id, username, email, password_hash as "passwordHash",
        nombre_completo as "fullName", tipo_usuario as type, activo as "isActive",
        ultimo_acceso as "lastLogin", fecha_creacion as "createdAt",
        fecha_actualizacion as "updatedAt"
      FROM usuarios
    `);

        // Note: Splitting fullName back to first/last name is tricky if not stored separately.
        // Assuming the DB stores fullName, but the entity expects first/last.
        // I will adjust the mapping to split by space for now, or update entity if needed.
        // Ideally, the DB should match the entity or vice versa.
        // Based on migrations: "nombre_completo VARCHAR(100)".
        // Based on entity: firstName, lastName.
        // I will split by first space.

        return result.rows.map(row => this.mapRowToUser(row));
    }

    async findUserById(id: number): Promise<User | null> {
        const result = await query(`
      SELECT 
        id_usuario as id, username, email, password_hash as "passwordHash",
        nombre_completo as "fullName", tipo_usuario as type, activo as "isActive",
        ultimo_acceso as "lastLogin", fecha_creacion as "createdAt",
        fecha_actualizacion as "updatedAt"
      FROM usuarios WHERE id_usuario = $1
    `, [id]);

        if (result.rows.length === 0) return null;
        return this.mapRowToUser(result.rows[0]);
    }

    async findUserByUsername(username: string): Promise<User | null> {
        const result = await query(`
      SELECT 
        id_usuario as id, username, email, password_hash as "passwordHash",
        nombre_completo as "fullName", tipo_usuario as type, activo as "isActive",
        ultimo_acceso as "lastLogin", fecha_creacion as "createdAt",
        fecha_actualizacion as "updatedAt"
      FROM usuarios WHERE username = $1
    `, [username]);

        if (result.rows.length === 0) return null;
        return this.mapRowToUser(result.rows[0]);
    }

    async findUserByEmail(email: string): Promise<User | null> {
        const result = await query(`
      SELECT 
        id_usuario as id, username, email, password_hash as "passwordHash",
        nombre_completo as "fullName", tipo_usuario as type, activo as "isActive",
        ultimo_acceso as "lastLogin", fecha_creacion as "createdAt",
        fecha_actualizacion as "updatedAt"
      FROM usuarios WHERE email = $1
    `, [email]);

        if (result.rows.length === 0) return null;
        return this.mapRowToUser(result.rows[0]);
    }

    async createUser(user: User): Promise<User> {
        const result = await query(`
      INSERT INTO usuarios (
        username, email, password_hash, nombre_completo, tipo_usuario, activo
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id_usuario as id, fecha_creacion as "createdAt", fecha_actualizacion as "updatedAt"
    `, [
            user.username, user.email, user.props.passwordHash, user.fullName,
            user.type, user.isActive
        ]);

        const newProps = { ...user.props, ...result.rows[0] };
        return new User(newProps);
    }

    async updateUser(user: User): Promise<User> {
        const result = await query(`
      UPDATE usuarios SET
        username = $1, email = $2, password_hash = $3, nombre_completo = $4,
        tipo_usuario = $5, activo = $6, fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id_usuario = $7
      RETURNING fecha_actualizacion as "updatedAt"
    `, [
            user.username, user.email, user.props.passwordHash, user.fullName,
            user.type, user.isActive, user.id
        ]);

        const newProps = { ...user.props, ...result.rows[0] };
        return new User(newProps);
    }

    async deleteUser(id: number): Promise<void> {
        await query('DELETE FROM usuarios WHERE id_usuario = $1', [id]);
    }

    // Roles
    async findAllRoles(): Promise<Role[]> {
        const result = await query(`
      SELECT 
        id_perfil as id, nombre as name, descripcion as description,
        tipo_perfil as type, nivel_acceso as "accessLevel", activo as "isActive",
        fecha_creacion as "createdAt"
      FROM perfiles_acceso
    `);
        return result.rows.map(row => new Role(row as RoleProps));
    }

    async findRoleById(id: number): Promise<Role | null> {
        const result = await query(`
      SELECT 
        id_perfil as id, nombre as name, descripcion as description,
        tipo_perfil as type, nivel_acceso as "accessLevel", activo as "isActive",
        fecha_creacion as "createdAt"
      FROM perfiles_acceso WHERE id_perfil = $1
    `, [id]);

        if (result.rows.length === 0) return null;
        return new Role(result.rows[0] as RoleProps);
    }

    async assignRoleToUser(userId: number, roleId: number): Promise<void> {
        await query(`
      INSERT INTO usuarios_perfiles (id_usuario, id_perfil)
      VALUES ($1, $2)
      ON CONFLICT (id_usuario, id_perfil) DO NOTHING
    `, [userId, roleId]);
    }

    async findPermissionsByUserId(userId: number): Promise<Permission[]> {
        // Join users -> user_profiles -> profiles -> profile_permissions -> permissions
        const result = await query(`
      SELECT DISTINCT p.id_permiso as id, p.nombre as name, p.descripcion as description,
             p.modulo as module, p.recurso as resource, p.accion as action
      FROM permisos p
      JOIN perfiles_permisos pp ON p.id_permiso = pp.id_permiso
      JOIN usuarios_perfiles up ON pp.id_perfil = up.id_perfil
      WHERE up.id_usuario = $1 AND up.activo = TRUE
    `, [userId]);

        return result.rows.map(row => new Permission(row as PermissionProps));
    }

    private mapRowToUser(row: any): User {
        const nameParts = (row.fullName || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        return new User({
            id: row.id,
            username: row.username,
            email: row.email,
            passwordHash: row.passwordHash,
            firstName,
            lastName,
            type: row.type,
            isActive: row.isActive,
            lastLogin: row.lastLogin,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt
        });
    }
}
