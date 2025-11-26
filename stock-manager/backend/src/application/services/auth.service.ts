import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../../domain/ports/user.repository';
import { User } from '../../domain/entities/user.entity';

export class AuthService {
    constructor(private readonly userRepository: UserRepository) { }

    async login(username: string, password: string): Promise<{ token: string; user: User }> {
        const user = await this.userRepository.findByUsername(username);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        if (!user.isActive) {
            throw new Error('User is inactive');
        }

        if (user.isLocked()) {
            throw new Error('User is locked');
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            user.incrementFailedAttempts();
            if (user.props.failedAttempts >= 5) {
                user.lock();
            }
            await this.userRepository.update(user);
            throw new Error('Invalid credentials');
        }

        // Reset failed attempts on successful login
        if (user.props.failedAttempts > 0) {
            user.resetFailedAttempts();
            await this.userRepository.update(user);
        }

        const token = jwt.sign(
            { userId: user.id, username: user.username, roleId: user.roleId },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '8h' }
        );

        return { token, user };
    }

    async register(username: string, password: string, email: string, fullName: string, roleId: number): Promise<User> {
        const existingUser = await this.userRepository.findByUsername(username);
        if (existingUser) {
            throw new Error('Username already exists');
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            passwordHash,
            email,
            fullName,
            roleId,
            isActive: true,
            failedAttempts: 0,
        });

        return this.userRepository.save(newUser);
    }
}
