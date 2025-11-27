import { Router } from 'express';
import { SystemConfigController } from '../controllers/system-config.controller';
import { PostgresSystemConfigRepository } from '../../repositories/postgres-system-config.repository';
import { authenticateToken, authorizeRole } from '../../middleware/auth.middleware';

const router = Router();
const repository = new PostgresSystemConfigRepository();
const controller = new SystemConfigController(repository);

// Only admins (roleId 1) should be able to manage system config
router.get('/', authenticateToken, authorizeRole([1]), (req, res) => controller.getAllConfigs(req, res));
router.get('/:key', authenticateToken, authorizeRole([1]), (req, res) => controller.getConfig(req, res));
router.put('/:key', authenticateToken, authorizeRole([1]), (req, res) => controller.updateConfig(req, res));

export default router;
