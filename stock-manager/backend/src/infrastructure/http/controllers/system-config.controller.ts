import { Request, Response } from 'express';
import { SystemConfigRepository } from '../../../domain/ports/system-config.repository';
import { SystemConfig } from '../../../domain/entities/system-config.entity';

export class SystemConfigController {
    constructor(private readonly configRepository: SystemConfigRepository) { }

    async getConfig(req: Request, res: Response) {
        try {
            const { key } = req.params;
            const config = await this.configRepository.findByKey(key);
            if (!config) {
                return res.status(404).json({ message: 'Config not found' });
            }
            res.json(config.props);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateConfig(req: Request, res: Response) {
        try {
            const { key } = req.params;
            const { value, description } = req.body;

            if (!value) {
                return res.status(400).json({ message: 'Value is required' });
            }

            const config = new SystemConfig({
                key,
                value,
                description
            });

            const savedConfig = await this.configRepository.save(config);
            res.json(savedConfig.props);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    async getAllConfigs(req: Request, res: Response) {
        try {
            const configs = await this.configRepository.findAll();
            res.json(configs.map(c => c.props));
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}
