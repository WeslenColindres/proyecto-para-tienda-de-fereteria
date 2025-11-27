import { UserRepository } from '../../domain/ports/UserRepository';
import { User, UserProps } from '../../domain/entities/User';
import { Role } from '../../domain/entities/Role';

export class UserService {
    constructor(private readonly userRepo: UserRepository) { }

    async registerUser(props: UserProps): Promise<User> {
        const existingUsername = await this.userRepo.findUserByUsername(props.username);
        if (existingUsername) {
            throw new Error(`Username ${props.username} already taken`);
        }

        const existingEmail = await this.userRepo.findUserByEmail(props.email);
        if (existingEmail) {
            throw new Error(`Email ${props.email} already registered`);
        }

        // TODO: Hash password here if not already hashed in props
        // For now assuming props has passwordHash

        const user = new User(props);
        return this.userRepo.createUser(user);
    }

    async assignRole(userId: number, roleId: number): Promise<void> {
        const user = await this.userRepo.findUserById(userId);
        if (!user) throw new Error('User not found');

        const role = await this.userRepo.findRoleById(roleId);
        if (!role) throw new Error('Role not found');

        await this.userRepo.assignRoleToUser(userId, roleId);
    }

    async getUserPermissions(userId: number) {
        return this.userRepo.findPermissionsByUserId(userId);
    }
}
