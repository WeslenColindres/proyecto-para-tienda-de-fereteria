import { Request, Response } from 'express';
import { AuthService } from '../../../application/services/auth.service';
import { PostgresUserRepository } from '../../repositories/postgres-user.repository';

const userRepository = new PostgresUserRepository();
const authService = new AuthService(userRepository);

export class AuthController {
    async login(req: Request, res: Response) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({ message: 'Username and password are required' });
            }

            const result = await authService.login(username, password);
            res.json(result);
        } catch (error: any) {
            res.status(401).json({ message: error.message });
        }
    }

    async register(req: Request, res: Response) {
        try {
            const { username, password, email, fullName, roleId } = req.body;
            // Basic validation
            if (!username || !password || !fullName || !roleId) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            const user = await authService.register(username, password, email, fullName, roleId);
            res.status(201).json(user);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async getProfile(req: Request, res: Response) {
        // @ts-ignore
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const user = await userRepository.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Remove sensitive data
        const { passwordHash, ...safeUser } = user.props;
        res.json(safeUser);
    }
}
