import { SystemConfig } from '../entities/system-config.entity';

export interface SystemConfigRepository {
    findByKey(key: string): Promise<SystemConfig | null>;
    save(config: SystemConfig): Promise<SystemConfig>;
    findAll(): Promise<SystemConfig[]>;
}
