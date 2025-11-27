import { User } from '../entities/User';
import { Role } from '../entities/Role';
import { Permission } from '../entities/Permission';

export interface UserRepository {
    // Users
    findAllUsers(): Promise<User[]>;
    findUserById(id: number): Promise<User | null>;
    findUserByUsername(username: string): Promise<User | null>;
    findUserByEmail(email: string): Promise<User | null>;
    createUser(user: User): Promise<User>;
    updateUser(user: User): Promise<User>;
    deleteUser(id: number): Promise<void>;

    // Roles & Permissions
    findAllRoles(): Promise<Role[]>;
    findRoleById(id: number): Promise<Role | null>;
    assignRoleToUser(userId: number, roleId: number): Promise<void>;

    // Auth
    findPermissionsByUserId(userId: number): Promise<Permission[]>;
}
