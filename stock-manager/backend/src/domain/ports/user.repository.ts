import { User } from '../entities/user.entity';

export interface UserRepository {
    findById(id: number): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    save(user: User): Promise<User>;
    update(user: User): Promise<User>;
    delete(id: number): Promise<void>;
}
