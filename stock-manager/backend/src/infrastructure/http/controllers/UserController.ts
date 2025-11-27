import { Request, Response } from 'express';
import { UserService } from '../../../application/services/UserService';
import { PostgresUserRepository } from '../../repositories/PostgresUserRepository';

const userRepo = new PostgresUserRepository();
const userService = new UserService(userRepo);

export class UserController {
    async registerUser(req: Request, res: Response) {
        try {
            const user = await userService.registerUser(req.body);
            res.status(201).json(user);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async assignRole(req: Request, res: Response) {
        try {
            const { userId, roleId } = req.body;
            await userService.assignRole(userId, roleId);
            res.json({ message: 'Role assigned successfully' });
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    async getUserPermissions(req: Request, res: Response) {
        try {
            const userId = Number(req.params.userId);
            const permissions = await userService.getUserPermissions(userId);
            res.json(permissions);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}
